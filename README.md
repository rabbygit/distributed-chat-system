# Design Scalable Chat System

Topics

1. Problem discussion
    - How web socket works?
    - Limitations of socket connection.
2. High level design overview
3. Design service registry
4. Load balancing with nginx for service registry
5. Design socket server
6. Introduce redis pub/sub with socket servers
7. Scale redis with sentinel
8. Design client service
9. Health checker service
10. Configure docker compose file

# Problem Discussion
HTTP protocol: HTTP is a *stateless* protocol that runs on top of TCP which is a connection-oriented protocol it guarantees the delivery of data packet transfer using the three-way handshaking methods and re-transmits the lost packets.It is a *unidirectional* where the client sends the request and the server sends the response. Let’s take an example when a user sends a request to the server this request goes in the form of HTTP or HTTPS, after receiving a request server send the response to the client, each request is associated with a corresponding response, after sending the response the connection gets closed, each HTTP or HTTPS request establish the new connection to the server every time and after getting the response the connection gets terminated by itself. 

![how http works](./assets/http.png)

WebSocket: WebSocket is a *stateful* protocol, which means the connection between client and server will keep alive until it is terminated by either party (client or server). After closing the connection by either of the client and server, the connection is terminated from both ends. WebSocket is *bidirectional*, a full-duplex protocol that is used in the same scenario of client-server communication, unlike HTTP it starts from ws:// or wss://. 

whenever we initiate the connection between client and server, the client-server made the handshaking and decide to create a new connection and this connection will keep alive until terminated by any of them.

This is how after client-server handshaking, the client-server decide on a new connection to keep it alive, this new connection will be known as WebSocket. Once the communication link establishment and the connection are opened, message exchange will take place in bidirectional mode until connection persists between client-server.

![how web socket works](./assets/websocket.png)

### Issue with socket connection:
One important point is when a socket connection established, the connection will persist untill server or client terminates.We know at a given time, server can have a fix amount of tcp connections.So, when the system grows, more servers are required to server the users.We can think, if we put n number of socket servers behind a layer-7 load balancer(Ex: nginx), which will distribute the connection requests may solve the problem.

No, there are still some issues like:
- Load balancer also have tcp connection limit
- Unable to detect which server has already exceeded connection limit

# High level design overview
What if we remove load balancer from the front line of socket servers and put it in front of an intermidiate server called service registry.When a client wants to establish socket connection, it will request the service registry first and service registry will check which socket server is able to accept new socket connection and tell the client to connect to that healthy socket server.

# Design service registry
The main responsibility of this service is to instruct a client to which socket server to connect. Whenever, we add a new socket server to the system, we'll notify this sevice. It will keep track of available socket servers and their total socket connection in redis server in a sorted manner by connection. We'll use MinHeap data structure to keep those socket servers records which is implemented as *Sorted Set* in redis. So, when a client will request for socket server address, it will take first element from the *Sorted Set*.

# Load balancing with nginx for service registry
if we have millions of users, we can't serve those users from a single service registry service. So, to overcome this limitations we can scale horizontally the service registry service by increasing number of servers and introduce layer-7 load balancer(nginx/haproxy/apache etc) in front of those servers to distibute the load.

# Design socket server
This service is simple web socket server which accepts socket connection.It has some additional responsibilities like when a new connection will establish successfully, it will increase its connection count in redis server. Similarly, if a connection closed or terminates it will decrease its connection count.

# Introduce redis pub/sub with socket servers
So far, socket connection management is not going to be a problem since we are using multiple socket servers and load balanced because of our service registry service. But there is issue, consider this scenario:

Suppose, user-A connects to a socket server let's say socket-server-1. and another user, user-B connects to a socket server let's say socket-server-2. Now, if user-A wants to send message to user-B, is it possible with our current setup?

No, because socket-server-1 has no knowledge about user-B since user-B is connected with socket-server-2. So, we need a mechanism to pass the message to socket-server-2.

We'll use pub/sub message broker among those socket servers where every socket server will act as publisher and subscriber. Since, we are already using redis for tracking socket server, we can also use it as our pub/sub message broker. 

# Scale redis with sentinel
We are using redis for two purposes, as data storage and pub/sub broker.If we use only one redis server and if this redis server fails for some reasons, our whole system will crash.So, we need to deploy multiple redis server in different avability regions. 