import WebSocket from 'ws';
import pool from '../db/connection.js';

export function initializeWebSocket(server) {
    try {
        const wss = new WebSocket.Server({ server, noServer: false });

        wss.on('connection', async (ws, req) => {
            try {
                // Get token from URL params - with safety checks
                let token = null;
                try {
                    if (req.url) {
                        const urlObj = new URL(req.url, 'ws://localhost');
                        token = urlObj.searchParams.get('token');
                    }
                } catch (urlError) {
                    console.warn('URL parsing error:', urlError.message);
                }
                
                if (!token) {
                    ws.close(1000, 'No token provided');
                    return;
                }

                ws.userId = null;
                ws.isAlive = true;

                // Send initial connection confirmation
                ws.send(JSON.stringify({
                    type: 'connection_established',
                    message: 'WebSocket connected'
                }));

                // Handle incoming messages
                ws.on('message', async (message) => {
                    try {
                        const data = JSON.parse(message);
                        
                        if (data.type === 'request_stats_update' && data.userId) {
                            ws.userId = data.userId;
                            const stats = await getUserStats(data.userId);
                            ws.send(JSON.stringify({
                                type: 'stats_update',
                                data: stats
                            }));
                        }
                    } catch (parseError) {
                        console.error('Message parse error:', parseError.message);
                    }
                });

                // Handle pings/heartbeat
                ws.on('pong', () => {
                    ws.isAlive = true;
                });

                // Clean up on close
                ws.on('close', () => {
                    console.log('WebSocket closed');
                });

                ws.on('error', (error) => {
                    console.error('WebSocket connection error:', error.message);
                });

            } catch (error) {
                console.error('WebSocket connection handler error:', error.message);
                try {
                    ws.close(1011, 'Internal server error');
                } catch (closeError) {
                    console.error('Error closing WebSocket:', closeError.message);
                }
            }
        });

        // Heartbeat interval to keep connections alive
        const heartbeatInterval = setInterval(() => {
            wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    ws.terminate();
                    return;
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000); // Every 30 seconds

        // Cleanup on server close
        server.on('close', () => {
            clearInterval(heartbeatInterval);
        });

        console.log('✅ WebSocket server initialized');
        return wss;
    } catch (error) {
        console.error('❌ Failed to initialize WebSocket:', error.message);
        console.error(error);
        return null;
    }
}

async function getUserStats(userId) {
    try {
        if (!userId || !pool) {
            return null;
        }

        // Simple query without complex CTEs
        const statsQuery = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.experience_points,
                u.streak_count,
                COUNT(tr.id) as total_tests,
                COALESCE(AVG(tr.percentage), 0) as avg_score,
                COALESCE(MAX(tr.percentage), 0) as best_score
            FROM users u
            LEFT JOIN test_results tr ON u.id = tr.user_id
            WHERE u.id = $1
            GROUP BY u.id, u.name, u.experience_points, u.streak_count
        `, [userId]);

        return statsQuery.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user stats:', error.message);
        return null;
    }
}