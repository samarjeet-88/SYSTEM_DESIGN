// import koffi from "koffi";
// import decode from "./decode.js";
// import evalCommand from "./evalCommand.js";

// const libc = koffi.load("libc.so.6");

// const AF_INET = 2;
// const SOCK_STREAM = 1;
// const SOL_SOCKET = 1;
// const SO_REUSEADDR = 2;
// const F_GETFL = 3;
// const F_SETFL = 4;
// const O_NONBLOCK = 0x800;

// const EPOLL_CTL_ADD = 1;
// const EPOLL_CTL_DEL = 2;
// const EPOLL_CTL_MOD = 3;

// const EPOLLIN = 0x001;
// const EPOLLOUT = 0x004;
// const EPOLLERR = 0x008;
// const EPOLLHUP = 0x010;
// const EPOLLRDHUP = 0x2000;

// const epoll_data_t = koffi.union("epoll_data_t", {
//     ptr: "void*",
//     fd: "int",
//     u32: "uint32_t",
//     u64: "uint64_t"
// });

// const epoll_event_t = koffi.struct("epoll_event_t", {
//     events: "uint32_t",
//     data: epoll_data_t
// });

// const sockaddr_in_t = koffi.struct("sockaddr_in_t", {
//     sin_family: "short",
//     sin_port: "unsigned short",
//     sin_addr: "uint32_t",
//     sin_zero: koffi.array("char", 8)
// });

// const socket_fn = libc.func("int socket(int domain, int type, int protocol)");
// const setsockopt_fn = libc.func("int setsockopt(int sockfd, int level, int optname, const void* optval, int optlen)");
// const bind_fn = libc.func("int bind(int sockfd, sockaddr_in_t* addr, int addrlen)");
// const listen_fn = libc.func("int listen(int sockfd, int backlog)");
// const accept_fn = libc.func("int accept(int sockfd, void* addr, void* addrlen)");
// const fcntl_fn = libc.func("int fcntl(int fd, int cmd, int arg)");
// const read_fn = libc.func("intptr_t read(int fd, void* buf, size_t count)");
// const write_fn = libc.func("intptr_t write(int fd, const void* buf, size_t count)");
// const close_fn = libc.func("int close(int fd)");

// const epoll_create1_fn = libc.func("int epoll_create1(int flags)");
// const epoll_ctl_fn = libc.func("int epoll_ctl(int epfd, int op, int fd, epoll_event_t* event)");
// const epoll_wait_fn = libc.func("int epoll_wait(int epfd, _Out_ epoll_event_t* events, int maxevents, int timeout)");

// function htons(port) {
//     return ((port & 0xFF) << 8) | ((port >> 8) & 0xFF);
// }

// function setNonBlocking(fd) {
//     const flags = fcntl_fn(fd, F_GETFL, 0);
//     fcntl_fn(fd, F_SETFL, flags | O_NONBLOCK);
// }

// const PORT = 6381;

// const serverFd = socket_fn(AF_INET, SOCK_STREAM, 0);
// if (serverFd < 0) {
//     throw new Error("Failed to create socket");
// }

// const optval = Buffer.alloc(4);
// optval.writeInt32LE(1, 0);
// setsockopt_fn(serverFd, SOL_SOCKET, SO_REUSEADDR, optval, 4);

// setNonBlocking(serverFd);

// const serverAddr = {
//     sin_family: AF_INET,
//     sin_port: htons(PORT),
//     sin_addr: 0,
//     sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
// };

// if (bind_fn(serverFd, serverAddr, koffi.sizeof(sockaddr_in_t)) < 0) {
//     throw new Error(`Failed to bind on port ${PORT}`);
// }

// if (listen_fn(serverFd, 1024) < 0) {
//     throw new Error("Failed to listen");
// }

// const epfd = epoll_create1_fn(0);
// if (epfd < 0) {
//     throw new Error("Failed to create epoll instance");
// }

// const serverEvent = {
//     events: EPOLLIN,
//     data: { fd: serverFd }
// };

// if (epoll_ctl_fn(epfd, EPOLL_CTL_ADD, serverFd, serverEvent) < 0) {
//     throw new Error("Failed to add serverFd to epoll");
// }

// console.log(`🚀 Raw epoll Redis Server listening on port ${PORT}`);

// const MAX_EVENTS = 128;
// const eventsArray = new Array(MAX_EVENTS).fill(null).map(() => ({
//     events: 0,
//     data: { fd: 0 }
// }));

// const readBuffer = Buffer.alloc(4096);
// const clientBuffers = new Map();

// while (true) {
//     const numReady = epoll_wait_fn(epfd, eventsArray, MAX_EVENTS, -1);

//     for (let i = 0; i < numReady; i++) {
//         const event = eventsArray[i];
//         const fd = event.data.fd;
//         const evFlags = event.events;

//         if (fd === serverFd) {
//             while (true) {
//                 const clientFd = accept_fn(serverFd, null, null);
//                 if (clientFd < 0) {
//                     break;
//                 }

//                 setNonBlocking(clientFd);

//                 const clientEvent = {
//                     events: EPOLLIN | EPOLLRDHUP,
//                     data: { fd: clientFd }
//                 };

//                 epoll_ctl_fn(epfd, EPOLL_CTL_ADD, clientFd, clientEvent);
//                 clientBuffers.set(clientFd, "");
//                 console.log(`[+] New client connected: fd=${clientFd}`);
//             }
//         }
//         else if (evFlags & (EPOLLRDHUP | EPOLLHUP | EPOLLERR)) {
//             epoll_ctl_fn(epfd, EPOLL_CTL_DEL, fd, null);
//             close_fn(fd);
//             clientBuffers.delete(fd);
//             console.log(`[-] Client disconnected (HUP/ERR): fd=${fd}`);
//         }
//         else if (evFlags & EPOLLIN) {
//             const bytesRead = read_fn(fd, readBuffer, readBuffer.length);

//             if (bytesRead <= 0) {
//                 epoll_ctl_fn(epfd, EPOLL_CTL_DEL, fd, null);
//                 close_fn(fd);
//                 clientBuffers.delete(fd);
//                 console.log(`[-] Client disconnected: fd=${fd}`);
//             } else {
//                 let pending = clientBuffers.get(fd) + readBuffer.toString("utf8", 0, bytesRead);

//                 let result;
//                 while ((result = decode(pending)) !== null) {
//                     const [command, consumed] = result;
//                     pending = pending.slice(consumed);

//                     console.log(`[fd=${fd}] Parsed:`, command);

//                     const response = evalCommand(command);
//                     const respBuf = Buffer.from(response, "utf8");
//                     write_fn(fd, respBuf, respBuf.length);
//                 }

//                 clientBuffers.set(fd, pending);
//             }
//         }
//     }
// }



// // epfd is the file descriptor for the epoll itself, 