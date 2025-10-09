Project Settings
General settings
Project name
TradeMate Pro
Project ID
amgtktrwpdsigcomavlg

anon key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODE1ODcsImV4cCI6MjA2OTY1NzU4N30.5jbqp_kJ1POnrfKuO1_1bzuVscSEWI3FI6k3r8NCLew

service key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODE1ODcsImV4cCI6MjA2OTY1NzU4N30.5jbqp_kJ1POnrfKuO1_1bzuVscSEWI3FI6k3r8NCLew

psql info

Connect to your project
Get the connection strings and environment variables for your app

Connection String
App Frameworks
Mobile Frameworks
ORMs
Type

PSQL
Source

Primary database
Direct connection
Ideal for applications with persistent, long-lived connections, such as those running on virtual machines or long-standing containers.

psql -h db.amgtktrwpdsigcomavlg.supabase.co -p 5432 -d postgres -U postgres


View parameters
Suitable for long-lived, persistent connections
Each client has a dedicated connection to Postgres
Not IPv4 compatible
Use Session Pooler if on a IPv4 network or purchase IPv4 add-on
IPv4 add-on
Pooler settings

Some platforms are IPv4-only:
Transaction pooler
Shared Pooler
Ideal for stateless applications like serverless functions where each interaction with Postgres is brief and isolated.

psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -d postgres -U postgres.amgtktrwpdsigcomavlg

Does not support PREPARE statements


View parameters
Suitable for a large number of connected clients
Clients share a connection pool
IPv4 compatible
Transaction pooler connections are IPv4 proxied for free.
Session pooler
Shared Pooler
Only recommended as an alternative to Direct Connection, when connecting via an IPv4 network.

psql -h aws-0-us-east-1.pooler.supabase.com -p 5432 -d postgres -U postgres.amgtktrwpdsigcomavlg


View parameters
IPv4 compatible
Session pooler connections are IPv4 proxied for free
Only use on a IPv4 network
Use Direct Connection if connecting via an IPv6 network
Reset your database password

You may reset your database password in your project's Database Settings

uri info 

Connect to your project
Get the connection strings and environment variables for your app

Connection String
App Frameworks
Mobile Frameworks
ORMs
Type

URI
Source

Primary database
Direct connection
Ideal for applications with persistent, long-lived connections, such as those running on virtual machines or long-standing containers.

postgresql://postgres:[YOUR-PASSWORD]@db.amgtktrwpdsigcomavlg.supabase.co:5432/postgres


View parameters
Suitable for long-lived, persistent connections
Each client has a dedicated connection to Postgres
Not IPv4 compatible
Use Session Pooler if on a IPv4 network or purchase IPv4 add-on
IPv4 add-on
Pooler settings

Some platforms are IPv4-only:
Transaction pooler
Shared Pooler
Ideal for stateless applications like serverless functions where each interaction with Postgres is brief and isolated.

postgresql://postgres.amgtktrwpdsigcomavlg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

Does not support PREPARE statements


View parameters
Suitable for a large number of connected clients
Clients share a connection pool
IPv4 compatible
Transaction pooler connections are IPv4 proxied for free.
Session pooler
Shared Pooler
Only recommended as an alternative to Direct Connection, when connecting via an IPv4 network.

postgresql://postgres.amgtktrwpdsigcomavlg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres


View parameters
IPv4 compatible
Session pooler connections are IPv4 proxied for free
Only use on a IPv4 network
Use Direct Connection if connecting via an IPv6 network
Reset your database password

You may reset your database password in your project's Database Settings