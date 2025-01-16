Harddisk Management:
javascriptCopyPOST /api/harddisks - Create new harddisk
PUT /api/harddisks/:id/rfid - Link RFID to harddisk
PUT /api/harddisks/:id/ready - Mark harddisk as ready
PUT /api/harddisks/:id/not-ready - Mark harddisk as not ready
GET /api/harddisks - Get all harddisks (with optional availability filter)
GET /api/harddisks/:rfid - Find harddisk by RFID
Movie Management:
javascriptCopyPOST /api/movies - Create movie and pending rentals
GET /api/movies/:id/harddisks - Get all harddisks for a movie
GET /api/movies/:id/rentals - Get rentals for a movie (with status filter)
Rental Management:
javascriptCopyPUT /api/rentals/:id/assign-harddisk - Assign harddisk to rental
PUT /api/rentals/:id/return - Return a rental