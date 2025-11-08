const express = require('express');
const router = express.Router();

// Demo employees data
const demoEmployees = [
  {
    id: 1,
    tenant_id: 1,
    name: 'Ahmad bin Ismail',
    position: 'Senior Consultant',
    salary: 6000,
    epf_number: 'EPF123456',
    socso_number: 'SOCSO123456'
  },
  {
    id: 2,
    tenant_id: 1,
    name: 'Siti Nurhaliza',
    position: 'Junior Consultant',
    salary: 3500,
    epf_number: 'EPF654321',
    socso_number: 'SOCSO654321'
  }
];

// Payroll calculations
router.get('/employees', (req, res) => {
  const tenantId = parseInt(req.query.tenant_id) || 1;
  const employees = demoEmployees.filter(emp => emp.tenant_id === tenantId);
  res.json(employees);
});

router.post('/payroll/calculate', (req, res) => {
  const { employeeId, month, year, overtime = 0 } = req.body;
  const employee = demoEmployees.find(emp => emp.id === parseInt(employeeId));
  
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  const basicSalary = employee.salary;
  const overtimePay = overtime * (employee.salary / 160); // Assuming 160 working hours per month
  const grossSalary = basicSalary + overtimePay;
  
  // Malaysia statutory calculations (simplified)
  const epfEmployee = grossSalary * 0.11;
  const epfEmployer = grossSalary * 0.13;
  const socso = Math.min(grossSalary * 0.005, 9.15); // Simplified SOCSO
  const eis = Math.min(grossSalary * 0.002, 2.94); // Simplified EIS
  
  const netSalary = grossSalary - epfEmployee - socso - eis;
  
  res.json({
    employee: employee.name,
    basicSalary,
    overtime,
    overtimePay,
    grossSalary,
    deductions: {
      epfEmployee,
      epfEmployer,
      socso,
      eis
    },
    netSalary,
    employerContributions: {
      epf: epfEmployer,
      socso: Math.min(grossSalary * 0.015, 13.40),
      eis: Math.min(grossSalary * 0.002, 2.94)
    }
  });
});

module.exports = router;