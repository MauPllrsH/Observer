// src/components/Dashboard.jsx
import { useState, useEffect } from 'react'

const Dashboard = () => {
    const [logs, setLogs] = useState([])
    const [stats, setStats] = useState({
        total_logs: 0,
        total_attacks: 0,
        recent_attacks: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logsResponse, statsResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/logs'),
                    fetch('http://localhost:5000/api/stats')
                ])

                const logsData = await logsResponse.json()
                const statsData = await statsResponse.json()

                setLogs(logsData)
                setStats(statsData)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="dashboard">
            <div className="stats-container">
                <div className="stat-box">
                    <h3>Total Logs</h3>
                    <p>{stats.total_logs}</p>
                </div>
                <div className="stat-box">
                    <h3>Total Attacks</h3>
                    <p>{stats.total_attacks}</p>
                </div>
                <div className="stat-box">
                    <h3>Recent Attacks (24h)</h3>
                    <p>{stats.recent_attacks}</p>
                </div>
            </div>

            <div className="logs-container">
                <h2>Recent Logs</h2>
                <div className="logs-table">
                    {logs.map((log, index) => (
                        <div
                            key={index}
                            className={`log-entry ${log.analysis_result.injection_detected ? 'attack' : 'normal'}`}
                        >
                            <div className="log-header">
                                <span className="timestamp">{log.timestamp}</span>
                                <span className={`status ${log.analysis_result.injection_detected ? 'attack' : 'normal'}`}>
                  {log.analysis_result.injection_detected ? '⚠️ Attack Detected' : '✅ Normal'}
                </span>
                            </div>
                            <div className="log-details">
                                <p><strong>IP:</strong> {log.ip}</p>
                                <p><strong>Method:</strong> {log.method}</p>
                                <p><strong>Path:</strong> {log.path}</p>
                                {log.query && <p><strong>Query:</strong> {log.query}</p>}
                                {log.analysis_result.matched_rules.length > 0 && (
                                    <p><strong>Matched Rules:</strong> {log.analysis_result.matched_rules.join(', ')}</p>
                                )}
                                <p><strong>Message:</strong> {log.analysis_result.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard