**核心概念回顾：**

1.  **SQL 盲注 (Blind SQL Injection):** 应用程序的响应中不直接包含数据库错误信息或查询结果，攻击者需要通过判断应用程序的**行为**来推断数据库查询结果。
2.  **布尔盲注 (Boolean Blind):** 根据查询条件真假导致应用程序响应**内容**或**长度**的变化来判断。
3.  **时间盲注 (Time-Based Blind):** 根据查询条件真假导致应用程序响应**时间**的变化来判断（通常通过数据库的延迟函数实现）。
4.  **Burp Suite Intruder:** 自动化发送大量定制请求并分析响应的工具，非常适合进行盲注攻击。
5.  **Burp Suite Logger:** 记录 Burp Suite 中各种工具发送/接收的流量，方便后续审计和分析（虽然对于盲注的**结果分析**不如 Intruder 的结果表格直观，但可以记录每次请求/响应的细节）。
6.  **DVWA SQL Injection (Low):** 这个级别的 SQL 注入对用户输入没有做任何过滤，并且处理用户 ID 时是作为数字处理的，即查询可能是 `SELECT ... FROM users WHERE id = <input>`。

**目标:** 提取 DVWA 数据库中的用户名和密码。

**环境准备：**

1.  启动 DVWA (确保数据库已重置)。
2.  启动 Burp Suite Professional 或 Community Edition (免费版在速度和功能上有限制，但基本流程一致)。
3.  配置浏览器使用 Burp Suite 作为代理 (默认通常是 `127.0.0.1:8080`)。
4.  登录 DVWA。

**详细步骤：**

**第一步：捕获并发送请求到 Intruder**

1.  在浏览器中访问 DVWA 的 SQL Injection 页面 (Low 级别)。
2.  确保 Burp Suite 的 Proxy 模块处于拦截状态 (Intercept is on)。
3.  在 DVWA 的 User ID 输入框中输入一个有效的 ID，例如 `1`。
4.  点击 "Submit"。
5.  Burp Suite 会拦截到该请求。在 Proxy 的 Intercept 标签页中，右键点击该请求，选择 "Send to Intruder"。
6.  关闭 Proxy 的拦截功能 (Intercept is off)，或放行该请求，以便页面正常加载。

**第二步：配置 Intruder - 位置 (Positions)**

1.  切换到 Burp Suite 的 **Intruder** 标签页。
2.  进入 **Positions** 子标签页。
3.  点击右侧的 "Clear §" 按钮，清除 Burp Suite 自动添加的默认标记。
4.  找到请求中表示 User ID 的参数值。在 DVWA Low 级别，它通常是 URL 参数 `id` 的值，例如 `id=1`。
5.  我们要注入的 payload 将会替换掉整个 `1`。**选中** `1` 这个数字。
6.  点击 "Add §" 按钮。现在 `1` 应该被 `§` 符号包围，例如 `id=§1§`。这意味着 Intruder 将会用 Payload 替换掉 `§1§` 之间的内容。

**第三步：理解 Payload 结构**

由于是盲注，我们需要构造查询来**测试**某个条件是否为真。基本的结构是：

*   `ID_THAT_DOESNT_EXIST OR <condition> -- `
    *   `ID_THAT_DOESNT_EXIST`: 使用一个不存在的 ID (如 `-1` 或 `0`)，这样原始的 `id = <ID_THAT_DOESNT_EXIST>` 条件就是假的。整个 `WHERE` 子句的真假就完全取决于 `<condition>` 的结果。
    *   `OR <condition>`: 连接我们的测试条件。
    *   `-- `: 注释掉原始查询中后面的部分 (例如 `AND password = '...'`)。注意 ` -- ` 后面需要一个空格。

我们将利用 `<condition>` 来逐个字符地猜测数据库中的数据（例如，某个用户的密码的第 N 个字符是什么）。

**第四步：执行布尔盲注 (Boolean Blind)**

我们将通过判断响应的**长度**来判断条件是否为真。在 DVWA Low 级别，当查询找到用户时，会返回包含用户名和姓氏的页面，响应体较长；找不到用户时，响应体较短。

1.  **配置 Attack Type:** 在 Intruder 的 Positions 标签页，选择 **Batter Battering Ram** 作为 Attack Type。因为我们需要同时变化两个值：要猜测的**字符在字符串中的位置**，以及要猜测的**字符的 ASCII 值**。
2.  **构造 Payload 模板:** 修改 Positions 标签页中的 Payload 位置。假设我们要猜测 `users` 表中第一个用户的 `password` 的前 20 个字符。Payload 结构如下：
    `-1 OR ASCII(SUBSTRING((SELECT password FROM users LIMIT 0,1), §1§, 1)) = §2§ -- `
    *   `-1`: 不存在的用户 ID。
    *   `ASCII(SUBSTRING((SELECT password FROM users LIMIT 0,1), §1§, 1))`: 提取 `users` 表中第一条记录的 `password` 字段的第 `§1§` 个字符，并获取其 ASCII 值。
    *   `= §2§`: 将提取到的 ASCII 值与 `§2§` 进行比较。
    *   `-- `: 注释。
    *   **重要:** 在 `id=` 后面，粘贴这个构造好的 payload 模板。确保 `§1§` 和 `§2§` 被正确标记。例如，如果原来是 `id=§1§`，现在应该变成 `id=-1 OR ASCII(SUBSTRING((SELECT password FROM users LIMIT 0,1), §1§, 1)) = §2§ -- `。**再次选中** `§1§` 和 `§2§` 这两个位置，并点击 "Add §" (如果它们不是自动添加的话)。最终应该有两个 `§` 对。
3.  **配置 Payloads (Payloads 标签页):**
    *   **Payload Set 1:** 对应第一个 `§` (即 `§1§`)。
        *   Payload options -> Payload type: `Numbers`
        *   From: `1` (从字符串的第一个字符开始)
        *   To: `20` (假设密码不超过20个字符，可以根据需要调整)
        *   Step: `1`
    *   **Payload Set 2:** 对应第二个 `§` (即 `§2§`)。
        *   Payload options -> Payload type: `Numbers`
        *   From: `32` (常见可打印 ASCII 字符的起始值，例如空格)
        *   To: `126` (常见可打印 ASCII 字符的结束值，例如 '~')
        *   Step: `1`
4.  **配置 Options (Options 标签页):**
    *   **Grep - Extract:** 不用勾选，我们不提取内容，而是看长度。
    *   **Grep - Match:** 可以勾选，例如添加 `First name:` 或 `User ID exists` 作为判断条件。如果响应中包含这些字符串，说明条件 (`-1 OR ...`) 为真。但看长度更直观。
    *   **Analysis (非常重要):** 主要看 **Length** 列。
    *   Connections: 为了避免对服务器造成太大压力或被检测，可以适当降低并发连接数 (Number of threads)，例如设置为 `1` 或 `2`。
5.  **开始攻击:** 点击 Intruder 标签页顶部的 "Start attack"。
6.  **分析结果:**
    *   Attack 窗口会弹出，显示请求列表。
    *   重点关注 **Length** 列。
    *   你会发现大多数请求的 Length 是一样的 (条件为假时)，而少数请求的 Length 会显著不同 (条件为真时，返回了用户详情页面)。
    *   **确定 "True" Length:** 找到 Length 与大多数不同的那些请求，记下这个长度值。这就是条件为真时的响应长度。
    *   **提取数据:** 逐行查看请求。当 Length 等于 "True" Length 时，说明该行的 Payload 中的 `ASCII(...) = §2§` 条件为真。记下该行的 Payload 1 值 (字符位置) 和 Payload 2 值 (ASCII 值)。将 ASCII 值转换成字符。
    *   例如，如果发现当 Payload 1 = 1 (位置1) 且 Payload 2 = 100 (ASCII值 100) 时 Length 是 "True" Length，那么密码的第一个字符的 ASCII 值就是 100，对应的字符是 'd'。
    *   继续查看 Payload 1 = 2 (位置2) 的行，找到 Length 是 "True" Length 对应的 Payload 2 (ASCII值)， وهكذا，直到找到所有字符或达到设定的最大位置。

**第五步：执行时间盲注 (Time-Based Blind)**

我们将通过判断响应的**时间**来判断条件是否为真。如果条件为真，数据库执行 `SLEEP(N)` 函数会导致响应延迟 N 秒。

1.  **配置 Attack Type:** 同样选择 **Batter Battering Ram**。
2.  **构造 Payload 模板:** 修改 Positions 标签页中的 Payload 位置。使用 `IF` 和 `SLEEP` 函数：
    `-1 OR IF(ASCII(SUBSTRING((SELECT password FROM users LIMIT 0,1), §1§, 1)) = §2§, SLEEP(5), 0) -- `
    *   `IF(<condition>, SLEEP(5), 0)`: 如果 `<condition>` 为真，则执行 `SLEEP(5)` (延迟5秒)；否则执行 `0` (不延迟)。
    *   `ASCII(SUBSTRING((SELECT password FROM users LIMIT 0,1), §1§, 1)) = §2§`: 和布尔盲注中一样的字符提取和比较逻辑。
    *   将此 payload 模板粘贴到 `id=` 后面，并确保 `§1§` 和 `§2§` 被正确标记为 Payload 位置。
3.  **配置 Payloads (Payloads 标签页):** 与布尔盲注配置相同。
    *   Payload Set 1: Numbers (Position: 1 to 20)
    *   Payload Set 2: Numbers (ASCII values: 32 to 126)
4.  **配置 Options (Options 标签页):**
    *   **Connections:** **非常重要**，将 Number of threads 设置为 `1`。时间盲注对并发非常敏感，多个请求同时延迟会干扰判断。
    *   **Request:**
        *   Timeout: Increase response timeout. 设置一个足够长的时间，例如 `10000` 毫秒 (10秒)，以确保 Burp 不会因为延迟而提前终止请求。
    *   **Analysis (非常重要):** 主要看 **Response received** 列。
5.  **开始攻击:** 点击 "Start attack"。
6.  **分析结果:**
    *   Attack 窗口弹出。
    *   重点关注 **Response received** 列。
    *   大多数请求的 Response received 时间会很短 (几十到几百毫秒)，这是条件为假时的响应时间。
    *   少数请求的 Response received 时间会显著变长，接近你设定的 `SLEEP` 值 (例如 5000 毫秒左右)，这是条件为真时的响应时间。
    *   **确定 "True" Time:** 找到 Response received 时间显著变长的那些请求。
    *   **提取数据:** 逐行查看请求。当 Response received 时间显著变长时，说明该行的 Payload 中的 `ASCII(...) = §2§` 条件为真。记下该行的 Payload 1 值 (字符位置) 和 Payload 2 值 (ASCII 值)。将 ASCII 值转换成字符。

**第六步：提取更多数据**

一旦掌握了提取一个字段（如第一个用户的密码）的方法，你可以修改 Payload 模板来提取其他信息：

*   **数据库名:** `-1 OR IF(ASCII(SUBSTRING(DATABASE(), §1§, 1)) = §2§, SLEEP(5), 0) -- `
*   **表名 (第一个表):** `-1 OR IF(ASCII(SUBSTRING((SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() LIMIT 0,1), §1§, 1)) = §2§, SLEEP(5), 0) -- ` (需要知道数据库名，或者用 `DATABASE()` 代替)
*   **列名 (某个表的第一个列):** `-1 OR IF(ASCII(SUBSTRING((SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' LIMIT 0,1), §1§, 1)) = §2§, SLEEP(5), 0) -- ` (需要知道数据库名和表名)
*   **特定用户的密码 (假设用户名为 'admin'):** `-1 OR IF(ASCII(SUBSTRING((SELECT password FROM users WHERE username = 'admin' LIMIT 0,1), §1§, 1)) = §2§, SLEEP(5), 0) -- ` (需要知道用户名)

每次提取一种信息，都需要重新配置 Intruder 的 Payloads，设置合适的位置范围。

**关于 Logger 模块：**

Logger 模块可以记录 Burp Suite 中所有或特定工具（如 Intruder、Repeater）发送的请求和接收的响应。

*   **用途：**
    *   提供一个独立的、可搜索的流量历史记录，与 Proxy History 分开。
    *   方便对特定攻击（例如 Intruder 攻击）的所有请求/响应进行事后审计。
    *   可以根据各种条件（工具、主机、请求头、响应头、内容等）过滤日志。
*   **在盲注中的作用：** 虽然 Intruder 的 Attack 结果窗口已经非常直观地展示了关键信息（长度、时间、状态码），Logger 提供了每个请求/响应的完整细节。如果你需要深入检查某个特定请求的完整响应体，或者在 Intruder 攻击结束后回顾整个攻击过程的流量细节，Logger 会很有用。但它不是分析盲注**结果**（判断真假条件）的主要工具，这个任务由 Intruder 的结果分析功能更好地完成。

**总结：**

利用 Burp Suite Intruder 进行盲注是一个自动化、高效的过程。

*   **布尔盲注**依赖于观察应用程序响应的**长度**或**内容**变化。
*   **时间盲注**依赖于观察应用程序响应的**时间延迟**。

在 DVWA Low 级别，由于是数字型注入且无过滤，盲注相对容易实现。关键在于构造合适的 Payload 模板，使用 `Batter Battering Ram` 攻击类型同时变化字符位置和 ASCII 值，并通过 Intruder 的结果分析功能（Length 或 Response received）判断条件真假，最终拼凑出被隐藏的数据。Logger 作为辅助工具，可以记录流量供后续审计，但主要的结果分析在 Intruder 的 Attack 窗口中进行。

**重要提示：**

*   实际渗透测试中，时间盲注容易产生大量请求，可能被检测。布尔盲注在响应区别明显时更高效。
*   注意 SQL 语法，不同数据库（MySQL, SQL Server, Oracle 等）的盲注函数和 `information_schema` 结构不同。DVWA 默认使用 MySQL。
*   始终在授权的环境下进行渗透测试。

