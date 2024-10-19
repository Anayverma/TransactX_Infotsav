import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper function to extract usernames from messages
const extractUsernames = (notifications) => {
  const usernameSet = new Set();
  notifications.forEach(notification => {
    // Regex to extract any words that resemble usernames
    const foundUsernames = notification.message.match(/\b\w{3,50}\b/g); // Adjust this regex as per your username pattern
    if (foundUsernames) {
      foundUsernames.forEach(username => usernameSet.add(username));
    }
  });
  return [...usernameSet];
};

export async function POST(req) {
  try {
    // Fetch all notifications
    const { rows: notifications } = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');

    // Extract usernames from notifications
    const usernames = extractUsernames(notifications);

    // Fetch user details for the extracted usernames
    let userDetails = [];
    if (usernames.length > 0) {
      const { rows: users } = await pool.query(
        'SELECT username, email, mobile, wallets, location, lendMoney FROM users WHERE username = ANY($1)', 
        [usernames]
      );
      userDetails = users;
    }

    // Return notifications and user details
    return new Response(JSON.stringify({ notifications, userDetails }), { status: 200 });

  } catch (error) {
    console.error('Error fetching notifications and users:', error);
    return new Response(JSON.stringify({ error: 'Error fetching data' }), { status: 500 });
  }
}


// import { Pool } from 'pg';

// // Create a PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
//   ssl: { rejectUnauthorized: false }, // This handles SSL for your database connection
// });

// export async function POST(req) {
//   try {
//     // Fetch all notifications
//     const { rows } = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
//     return new Response(JSON.stringify(rows), { status: 200 });
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return new Response(JSON.stringify({ error: 'Error fetching notifications' }), { status: 500 });
//   }
// }