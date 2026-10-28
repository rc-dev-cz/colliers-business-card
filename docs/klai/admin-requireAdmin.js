// First onFormLoad step on every admin page (Admin Home, Manage Titles, Manage Credentials,
// Manage Addresses, Admin Order History, Reporting, Invoice History). Vue twin: router adminMeta + isAdmin().
// Admin pages are for admins only. FileMaker sets app.user.role ("admin" | "user") at login;
// anyone else is sent to the catalogue. FileMaker must still refuse admin hooks for non-admins.
var role = String((app.user && app.user.role) || '').trim().toLowerCase()
if (role !== 'admin') {
  window.location.hash = '#/'
}
