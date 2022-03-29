import { io } from "socket.io-client";

export let socket

export const initialize = (URL) => {
  socket = io(URL);

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
}