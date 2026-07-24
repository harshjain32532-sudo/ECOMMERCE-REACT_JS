import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useOrderTracking() {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transports: ["websocket", "polling"],
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            setIsConnected(true);

            // Get user ID from localStorage and subscribe to updates
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Decode JWT to get user ID (simplified - in production, verify on server)
                    const decoded = JSON.parse(atob(token.split(".")[1]));
                    if (decoded.id) {
                        newSocket.emit("user:join", decoded.id);
                        newSocket.emit("orders:subscribe", decoded.id);
                    }
                } catch (err) {
                    console.error("Error decoding token:", err);
                }
            }
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        // Listen for initial orders
        newSocket.on("orders:initial", (initialOrders) => {
            console.log("Received initial orders:", initialOrders);
            setOrders(initialOrders);
            setLoading(false);
        });

        // Listen for order updates
        newSocket.on("user:order:updated", (updatedOrder) => {
            console.log("Order updated:", updatedOrder);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === updatedOrder.id ? updatedOrder : order
                )
            );
        });

        // Global order update (for admin/broadcast)
        newSocket.on("order:updated", (updateData) => {
            console.log("Global order update received:", updateData);
            if (updateData.userId && updateData.order) {
                // Update if it's our order
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === updateData.orderId
                            ? { ...order, ...updateData.order }
                            : order
                    )
                );
            }
        });

        newSocket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    const getOrderUpdates = useCallback(
        (orderId) => {
            if (socket && socket.connected) {
                socket.emit("order:getUpdates", orderId);
            }
        },
        [socket]
    );

    return {
        socket,
        isConnected,
        orders,
        loading,
        getOrderUpdates,
        setOrders,
    };
}
