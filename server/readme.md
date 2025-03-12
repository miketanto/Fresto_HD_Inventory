Harddisk Management:
javascriptCopyPOST /harddisks - Create new harddisk
PUT /harddisks/:id/rfid - Link RFID to harddisk
PUT /harddisks/:id/ready - Mark harddisk as ready
PUT /harddisks/:id/not-ready - Mark harddisk as not ready
GET /harddisks - Get all harddisks (with optional availability filter)
GET /harddisks/:rfid - Find harddisk by RFID
Movie Management:
javascriptCopyPOST /movies - Create movie and pending rentals
GET /movies/:id/harddisks - Get all harddisks for a movie
GET /movies/:id/rentals - Get rentals for a movie (with status filter)
Rental Management:
javascriptCopyPUT /rentals/:id/assign-harddisk - Assign harddisk to rental
PUT /rentals/:id/return - Return a rental