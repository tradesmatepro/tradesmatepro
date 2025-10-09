General settings
Project name
TradesMatePro
Project ID
cxlqzejzraczumqmsrcx


anon key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg

service key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM


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

psql -h db.cxlqzejzraczumqmsrcx.supabase.co -p 5432 -d postgres -U postgres


DB project password Alphaecho19!

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

psql -h aws-1-us-west-1.pooler.supabase.com -p 6543 -d postgres -U postgres.cxlqzejzraczumqmsrcx

Does not support PREPARE statements


View parameters
Suitable for a large number of connected clients
Clients share a connection pool
IPv4 compatible
Transaction pooler connections are IPv4 proxied for free.
Session pooler
Shared Pooler
Only recommended as an alternative to Direct Connection, when connecting via an IPv4 network.

psql -h aws-1-us-west-1.pooler.supabase.com -p 5432 -d postgres -U postgres.cxlqzejzraczumqmsrcx


View parameters
IPv4 compatible
Session pooler connections are IPv4 proxied for free
Only use on a IPv4 network
Use Direct Connection if connecting via an IPv6 network


webapp username jeraldjsmith@gmail.com app passwordword Gizmo123