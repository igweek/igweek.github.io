[![](https://s2.loli.net/2024/11/21/SPFkmud9yOVBYXi.jpg)](https://s2.loli.net/2024/11/21/SPFkmud9yOVBYXi.jpg)

<p>SQL 注入（SQL Injection，SQLi）是一种利用 Web 应用程序中输入验证漏洞的攻击方法。攻击者通过在输入字段（如登录框、搜索栏或 URL 参数）中构造恶意 SQL 语句，导致应用程序生成意外的 SQL 查询，从而获得非授权访问数据库的权限，进而获取敏感数据、篡改数据或破坏数据库。</p>
<p>SQL 注入攻击类型多样，常见类型及其攻击原理、检测方法和防御措施如下：</p>
<h3>1. SQL 注入的基本原理</h3>
<p>SQL 注入攻击通过篡改应用程序原本预期的 SQL 查询，将恶意代码注入到数据库操作中。例如，在身份验证场景中，典型的 SQL 查询为：</p>
<pre><code class="language-sql">SELECT * FROM users WHERE username = 'user' AND password = 'password';</code></pre>
<p>攻击者可以输入 <code>username</code> 为 <code>admin' --</code>，将 <code>password</code> 留空。此时查询将被更改为：</p>
<pre><code class="language-sql">SELECT * FROM users WHERE username = 'admin' --' AND password = '';</code></pre>
<p>由于 <code>--</code> 为注释符，<code>password</code> 条件被忽略，SQL 查询实际上变为：</p>
<pre><code class="language-sql">SELECT * FROM users WHERE username = 'admin';</code></pre>
<p>从而绕过了身份验证，直接登录 <code>admin</code> 账户。</p>
万能密钥：' or 1=1#
SELECT * FROM users WHERE username = 'user' AND password = 'password';
<h3>2. 常见的 SQL 注入类型</h3>
<h4>2.1 基于联合（Union-based）注入</h4>
<p><strong>目的</strong>：通过 <code>UNION</code> 操作符将两个或多个查询结果合并，强制返回额外的数据。</p>
<ul>
<li><strong>攻击示例</strong>：<code>' UNION SELECT null, user(), database(), version() --</code>
<ul>
<li>此注入通过联合查询，返回数据库当前用户（<code>user()</code>）、数据库名称（<code>database()</code>）和版本（<code>version()</code>）。</li>
</ul></li>
<li><strong>适用场景</strong>：适用于有可见查询结果的页面（如搜索结果页面）。</li>
</ul>
<h4>2.2 基于错误（Error-based）注入</h4>
<p><strong>目的</strong>：利用 SQL 错误信息获取数据库结构和内容。</p>
<ul>
<li><strong>攻击示例</strong>：<code>' AND 1=1; DROP TABLE users; --</code>
<ul>
<li>此语句通过添加错误操作（如删除表），引发 SQL 错误，从而在错误提示信息中暴露数据库细节。</li>
</ul></li>
<li><strong>适用场景</strong>：适用于返回详细 SQL 错误信息的页面。</li>
</ul>
<h4>2.3 基于布尔（Boolean-based）盲注</h4>
<p><strong>目的</strong>：在无回显结果的情况下，通过判断查询的布尔值，逐步提取数据。</p>
<ul>
<li><strong>攻击示例</strong>：<code>' AND 1=1--</code> 和 <code>' AND 1=0--</code>
<ul>
<li>攻击者可以使用判断条件，例如 <code>1=1</code> 和 <code>1=0</code>，观察响应差异。例如，通过构造判断条件 <code>username='admin' AND SUBSTRING(password,1,1)='a'--</code> 逐字符获取密码。</li>
</ul></li>
<li><strong>适用场景</strong>：适用于无回显的页面，如密码验证页面。</li>
</ul>
<h4>2.4 基于时间（Time-based）盲注</h4>
<p><strong>目的</strong>：通过注入 SQL 函数（如 <code>SLEEP()</code>），利用页面响应延迟判断查询条件。</p>
<ul>
<li><strong>攻击示例</strong>：<code>' AND IF(1=1, SLEEP(5), 0)--</code>
<ul>
<li>如果条件为真（如 <code>1=1</code>），SQL 语句延迟执行 5 秒，攻击者可以通过响应时间判断条件是否成立。</li>
</ul></li>
<li><strong>适用场景</strong>：适用于无可见回显且不显示错误的页面。</li>
</ul>
<h3>3. SQL 注入检测方法</h3>
<p>SQL 注入的检测方法包括：</p>
<ol>
<li><strong>手动检测</strong>：通过输入常见的 SQL 注入符号（如 <code>‘ OR 1=1--</code>），观察页面是否返回预期之外的结果。</li>
<li><strong>自动化扫描工具</strong>：使用工具如 SQLMap、Burp Suite 等，扫描 Web 应用中的 SQL 注入漏洞。</li>
<li><strong>代码审查</strong>：通过代码分析，检查用户输入的拼接位置，特别是字符串拼接到 SQL 查询的地方。</li>
</ol>
<h3>4. 案例分析</h3>
<p>假设存在一个用户登录页面，通过以下查询验证用户身份：</p>
<pre><code class="language-sql">SELECT * FROM users WHERE username = 'user' AND password = 'pass';</code></pre>
<p>攻击者输入 <code>username</code> 为 <code>admin' --</code> 时，将导致 SQL 查询被注释掉一部分，系统直接返回 <code>admin</code> 用户的记录。</p>
<p>如果使用参数化查询或预编译语句，查询语句如下：</p>
<pre><code class="language-python">cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))</code></pre>
<p>无论攻击者输入如何恶意构造，<code>username</code> 和 <code>password</code> 只能被视为普通参数，不会影响 SQL 语句结构，确保了系统的安全性。</p>
<h3>总结</h3>
<p>SQL 注入是一种具有极高危害性的攻击方式，掌握不同类型 SQL 注入的工作原理及防御措施至关重要。通过严格的输入验证、参数化查询、最小化权限和使用 WAF，可以有效防止 SQL 注入攻击，保障系统数据安全。</p>