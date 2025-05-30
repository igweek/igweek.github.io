TCP三次握手过程是建立可靠连接的关键步骤

### 1. 第一次握手：客户端发送SYN
- **客户端**（通常是主动发起连接的一方）想要与服务器建立连接，它会向服务器发送一个SYN（同步）标志的数据包，表示希望开始连接。
- 这个数据包的序列号（Sequence Number）是客户端选择的一个初始值，比如X。这样，客户端就告诉服务器：“我想与你建立连接，初始序列号是X。”

  **图示**：  
  客户端 --> 服务器：`SYN, Sequence = X`

### 2. 第二次握手：服务器回应SYN+ACK
- 服务器收到客户端的SYN包后，确认接受到连接请求，并且向客户端发送一个带SYN标志的数据包，表示同意建立连接。该包还带有ACK（确认）标志，用来回应客户端的请求。
- 同时，服务器会生成一个新的初始序列号（假设为Y），并将客户端的序列号+1作为确认号（ACK Number）。这表示：“我收到了你发来的序列号X，我准备好与您建立连接，服务器的初始序列号是Y。”

  **图示**：  
  服务器 --> 客户端：`SYN, ACK, Sequence = Y, Ack = X + 1`

### 3. 第三次握手：客户端确认ACK
- 客户端收到服务器的SYN+ACK包后，确认服务器的序列号Y，并回复一个ACK包给服务器。这个ACK包的确认号是服务器序列号Y+1，表示客户端已经收到服务器的连接确认。
- 此时，客户端的序列号是X+1，表示客户端已准备好发送数据。

  **图示**：  
  客户端 --> 服务器：`ACK, Sequence = X + 1, Ack = Y + 1`

### 三次握手的关键点：
1. **SYN（同步）标志**：用于开始连接请求。
2. **ACK（确认）标志**：用于确认接收到的数据包。
3. **序列号**：用于标识数据流的顺序，保证数据的可靠传输。
4. **确认号**：表示接收到数据的下一个期望序列号。

通过这三次交换，客户端和服务器最终完成连接建立，并可以开始数据的双向传输。每一步的交互都确保了连接的可靠性和双方的同步状态。

### 类比
为了让学生更容易理解，可以通过以下类比：

假设你和朋友约定要打电话：
- **第一次握手**：你打电话给朋友，告诉他说“我想和你通话。”这就相当于客户端发SYN请求。
- **第二次握手**：朋友接到电话后回应：“好的，我同意和你通话，但我要先确认一下，等我准备好后，我会给你回复。” 这就相当于服务器回应SYN+ACK。
- **第三次握手**：你听到朋友的回应后说：“我已经准备好了，可以开始通话了。”这就相当于客户端发送ACK确认。
