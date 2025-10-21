import WebSocket from 'ws';
import { verifyToken } from '../middleware/auth.js';
import pool from '../db/connection.js';

export function initializeWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws, req) => {
        try {
            // Get token from URL params
            const url = new URL(req.url, 'ws://localhost');
            const token = url.searchParams.get('token');
            
            if (!token) {
                ws.close();
                return;
            }

            // Verify token and get user
            const user = await verifyToken(token);
            if (!user) {
                ws.close();
                return;
            }

            ws.userId = user.id;

            // Send initial stats
            const stats = await getUserStats(user.id);
            ws.send(JSON.stringify({
                type: 'stats_update',
                data: stats
            }));

            // Handle messages
            ws.on('message', async (message) => {
                const data = JSON.parse(message);
                
                if (data.type === 'request_stats_update') {
                    const updatedStats = await getUserStats(user.id);
                    ws.send(JSON.stringify({
                        type: 'stats_update',
                        data: updatedStats
                    }));
                }
            });

            // Clean up on close
            ws.on('close', () => {
                // Handle cleanup
            });

        } catch (error) {
            console.error('WebSocket error:', error);
            ws.close();
        }
    });

    return wss;
}

async function getUserStats(userId) {
    try {
        // Get comprehensive user stats
        const statsQuery = await pool.query(`
            WITH UserData AS (
                SELECT 
                    u.id,
                    u.name,
                    u.experience_points,
                    u.streak_count,
                    COUNT(tr.id) as total_tests,
                    COALESCE(AVG(tr.percentage), 0) as avg_score,
                    COALESCE(MAX(tr.percentage), 0) as best_score,
                    COUNT(DISTINCT tr.exam_type) as unique_exams_taken,
                    SUM(tr.total_questions) as total_questions_solved
                FROM users u
                LEFT JOIN test_results tr ON u.id = tr.user_id
                WHERE u.id = $1
                GROUP BY u.id
            ),
            RecentActivity AS (
                SELECT 
                    exam_type,
                    percentage,
                    created_at
                FROM test_results
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 5
            ),
            CategoryPerformance AS (
                SELECT 
                    jsonb_object_agg(
                        category,
                        jsonb_build_object(
                            'correct', SUM((category_scores->category->>'correct')::int),
                            'total', SUM((category_scores->category->>'total')::int)
                        )
                    ) as performance
                FROM test_results
                WHERE user_id = $1
            )
            SELECT 
                ud.*,
                COALESCE(
                    (SELECT array_to_json(array_agg(ra.*))
                     FROM RecentActivity ra),
                    '[]'
                ) as recent_activity,
                COALESCE(
                    (SELECT performance 
                     FROM CategoryPerformance),
                    '{}'::jsonb
                ) as category_performance
            FROM UserData ud;
        `, [userId]);

        return statsQuery.rows[0];
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
}