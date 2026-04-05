import { eventEmitter } from "@/lib/events";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Send initial ping to establish connection
            controller.enqueue(encoder.encode(':\n\n'));

            const onEvent = (data: any) => {
                try {
                    const message = `data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(message));
                } catch (e) {
                    console.error("SSE Enqueue Error:", e);
                }
            };

            eventEmitter.on('peminjaman_update', onEvent);

            // Keep connection alive with periodic pings
            const timer = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(':\n\n'));
                } catch (e) {
                    clearInterval(timer);
                    eventEmitter.off('peminjaman_update', onEvent);
                }
            }, 30000);

            // Cleanup when connection closes
            req.signal.addEventListener('abort', () => {
                clearInterval(timer);
                eventEmitter.off('peminjaman_update', onEvent);
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
