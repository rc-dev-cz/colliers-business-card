// Manage Degrees (admindegrees) onFormLoad.
// Until FileMaker returns `degrees`: the client's approved designations (Designations.xlsx, Oct 2026).
// Same list as Customize `degreeOptions` (onFormLoad-customize.js). FileMaker data wins when it is not empty.
var DEGREES = ["Arch. Tech", "Architect", "BA", "BSc", "CA", "CAPM", "CEC", "CEM", "CET", "CGA", "CMA", "CPA", "CSDP", "Dipl. Arch. Tech", "Eng. Tech", "EP(CEA)", "GSC", "LEED AP", "LEED AP BD+C", "LEED AP Homes", "LEED AP ID+C", "LEED AP ND", "LEED AP O+M", "LEED Green Assoc.", "MSc", "P. Eng.", "PgMP", "PMI-RMP", "PMI-SP", "PMP", "PQS", "Real Estate Broker"];
if (!Array.isArray(model.degrees) || !model.degrees.length) {
  model.degrees = DEGREES.slice();
}
