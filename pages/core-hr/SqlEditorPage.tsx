
import React, { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Terminal, AlertTriangle, Table } from 'lucide-react';

// A very basic, unsafe SQL parser. For demo purposes only.
const parseAndRunQuery = (query: string, data: any[]) => {
    query = query.trim().toLowerCase();
    if (!query.startsWith('select')) {
        throw new Error("Only SELECT queries are supported.");
    }

    const fromMatch = /from\s+(\w+)/.exec(query);
    if (!fromMatch || fromMatch[1] !== 'employees') {
        throw new Error("Can only query from the 'employees' table.");
    }

    const selectMatch = /select\s+(.+?)\s+from/.exec(query);
    if (!selectMatch) {
        throw new Error("Invalid SELECT clause.");
    }
    const columnsStr = selectMatch[1].trim();
    const columns = columnsStr === '*' ? Object.keys(data[0] || {}) : columnsStr.split(',').map(c => c.trim());

    let filteredData = [...data];
    const whereMatch = /where\s+(.+)/.exec(query);
    if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        // Super simplified WHERE: col = 'value'
        const whereParts = whereClause.match(/(\w+)\s*=\s*'([^']+)'/);
        if (whereParts) {
            const [, key, value] = whereParts;
            filteredData = filteredData.filter(item => String(item[key]).toLowerCase() === value.toLowerCase());
        } else {
             throw new Error("Unsupported WHERE clause. Use format: key = 'value'.");
        }
    }

    const results = filteredData.map(item => {
        const row: Record<string, any> = {};
        columns.forEach(col => {
            if(col in item) {
                row[col] = item[col];
            }
        });
        return row;
    });

    return results;
};


const SqlEditorPage: React.FC = () => {
    const { employees } = useAuth();
    const [query, setQuery] = useState('SELECT name, role, department FROM employees;');
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    
    const sampleQueries = [
        "SELECT * FROM employees;",
        "SELECT name, role FROM employees WHERE department = 'Technical';",
        "SELECT id, name, joiningDate FROM employees WHERE userRole = 'Admin';",
    ];

    const handleRunQuery = () => {
        setError(null);
        setResults(null);
        setHeaders([]);
        try {
            const res = parseAndRunQuery(query, employees);
            if (res.length > 0) {
                setHeaders(Object.keys(res[0]));
            }
            setResults(res);
        } catch (e: any) {
            setError(e.message);
        }
    };
    
    const renderValue = (value: any) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    }

    return (
        <PageWrapper title="SQL Editor">
            <Card>
                <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm border border-yellow-200 mb-4">
                    <AlertTriangle size={20} />
                    <div>
                        <strong>This is a simplified, frontend-only SQL runner for demonstration.</strong>
                        <p>It only supports basic <code className="bg-yellow-100 p-1 rounded">SELECT</code> queries on the <code className="bg-yellow-100 p-1 rounded">'employees'</code> table (e.g., <code className="bg-yellow-100 p-1 rounded">SELECT name, role FROM employees WHERE department = 'Technical'</code>).</p>
                    </div>
                </div>

                <div className="font-mono border border-slate-300 rounded-lg overflow-hidden">
                    <div className="p-2 bg-slate-100 border-b border-slate-300 text-sm text-slate-600">
                        neondb / public
                    </div>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-40 p-3 font-mono text-sm bg-white focus:outline-none resize-y"
                        placeholder="Enter your SQL query here..."
                    />
                </div>
                
                <div className="my-4">
                    <p className="text-sm text-slate-500 mb-2">Sample queries:</p>
                    <div className="flex flex-wrap gap-2">
                        {sampleQueries.map((q, i) => (
                            <button key={i} onClick={() => setQuery(q)} className="text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md">
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                <Button onClick={handleRunQuery} leftIcon={<Terminal size={16} />}>
                    Run Query
                </Button>
            </Card>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Table size={20} /> Results
                </h3>
                <Card>
                    {error && (
                        <div className="text-center p-6 text-red-600 bg-red-50 rounded-lg">
                            <p className="font-semibold">Query Error</p>
                            <p className="font-mono text-sm mt-1">{error}</p>
                        </div>
                    )}
                    {results && !error && (
                        results.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {headers.map(header => <th key={header} className="p-3 font-semibold text-slate-600">{header}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((row, i) => (
                                            <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                                                {headers.map(header => (
                                                    <td key={header} className="p-3 text-slate-700 max-w-xs truncate" title={renderValue(row[header])}>
                                                        {renderValue(row[header])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                 <p className="text-xs text-slate-500 mt-3">{results.length} rows returned.</p>
                            </div>
                        ) : (
                            <div className="text-center p-6 text-slate-500">
                                <p>Query executed successfully, but returned no results.</p>
                            </div>
                        )
                    )}
                    {!results && !error && (
                        <div className="text-center p-6 text-slate-400">
                            <p>Run a query to see results here.</p>
                        </div>
                    )}
                </Card>
            </div>
        </PageWrapper>
    );
};

export default SqlEditorPage;
