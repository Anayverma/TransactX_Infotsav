"use client"; // Ensure the component is a client component for hooks
import React from "react";
import { useEffect, useState } from "react";
import { useTable, useFilters, useSortBy } from "react-table";
import Navbar from '@/components/NavBar.jsx';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch transactions
  const fetchTransactions = async () => {
    const username = localStorage.getItem("username");

    if (!username) {
      setError("Username not found in localStorage.");
      setLoading(false);
      return;
    }

    try {
      const walletsData = localStorage.getItem("wallet");
      const wallets = JSON.parse(walletsData);

      if (!wallets || !Array.isArray(wallets)) {
        setError("No wallets found in localStorage.");
        setLoading(false);
        return;
      }

      const walletAccounts = wallets.map(wallet => wallet.account);

      const transactionsResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallets: walletAccounts }),
      });

      const transactionsData = await transactionsResponse.json();

      if (transactionsResponse.ok) {
        setTransactions(transactionsData.transactions);
      } else {
        setError(transactionsData.error || "Failed to fetch transactions.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const columns = React.useMemo(() => [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Sender",
      accessor: "sender_address",
      canFilter: true,
      Filter: ({ column }) => (
        <input
          type="text"
          value={column.filterValue || ''}
          onChange={(e) => column.setFilter(e.target.value)}
          placeholder="Search Sender"
          className="mt-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
        />
      ),
    },
    {
      Header: "Recipient",
      accessor: "recipient_address",
      canFilter: true,
      Filter: ({ column }) => (
        <input
          type="text"
          value={column.filterValue || ''}
          onChange={(e) => column.setFilter(e.target.value)}
          placeholder="Search Recipient"
          className="mt-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
        />
      ),
    },
    {
      Header: "Amount",
      accessor: "amount",
      canFilter: false, // Assuming no filter for amount
    },
    {
      Header: "Timestamp",
      accessor: "timestamp",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
  ], []);

  const data = React.useMemo(() => transactions, [transactions]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useSortBy
  );

  if (loading) return <p className="text-white">Loading transactions...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-black min-h-[100vh]">
      <Navbar></Navbar>
    <div className="p-6 bg-black rounded-lg">
    <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-black text-center mb-6">
          Passbook
        </h1>
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-gray-900 divide-y divide-gray-700">
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-800">
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className="px-4 py-2 text-sm text-gray-200">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-white">No transactions found.</p>}
    </div>
    </div>
  );
};

export default TransactionHistory;