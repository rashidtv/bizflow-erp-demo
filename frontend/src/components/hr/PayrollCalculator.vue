<template>
  <div class="payroll-page">
    <div class="page-header">
      <h1>💰 HR & Payroll</h1>
      <p>Malaysia Payroll Management with EPF, SOCSO, EIS</p>
    </div>

    <div class="demo-banner" v-if="$route.query.demo">
      <div class="demo-content">
        <span class="demo-badge">DEMO MODE</span>
        <p>Experience automated payroll processing with Malaysia statutory calculations</p>
      </div>
    </div>

    <div class="payroll-grid">
      <!-- Employee List -->
      <div class="employees-section">
        <div class="section-header">
          <h2>Employees</h2>
          <button class="btn-primary" @click="showAddEmployee = true">
            <span class="btn-icon">➕</span>
            Add Employee
          </button>
        </div>
        <div class="employees-list">
          <div v-for="employee in employees" :key="employee.id" class="employee-card">
            <div class="employee-avatar">
              {{ employee.name.charAt(0) }}
            </div>
            <div class="employee-info">
              <h4>{{ employee.name }}</h4>
              <p>{{ employee.position }}</p>
              <span class="employee-salary">RM {{ employee.salary.toLocaleString() }}</span>
            </div>
            <div class="employee-actions">
              <button class="btn-small" @click="calculatePayroll(employee)">Calculate</button>
              <button class="btn-small primary" @click="viewPayslip(employee)">Payslip</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payroll Calculator -->
      <div class="calculator-section">
        <h2>Payroll Calculator</h2>
        <div class="calculator">
          <div class="calc-inputs">
            <div class="form-group">
              <label>Select Employee</label>
              <select v-model="selectedEmployeeId" @change="onEmployeeSelect">
                <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                  {{ employee.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Basic Salary (RM)</label>
              <input type="number" v-model="calculation.basicSalary" @input="calculatePayroll">
            </div>
            
            <div class="form-group">
              <label>Overtime Hours</label>
              <input type="number" v-model="calculation.overtimeHours" @input="calculatePayroll">
            </div>
            
            <div class="form-group">
              <label>Bonus (RM)</label>
              <input type="number" v-model="calculation.bonus" @input="calculatePayroll">
            </div>
          </div>

          <div class="calc-results">
            <h3>Payroll Breakdown</h3>
            
            <div class="result-section">
              <h4>Earnings</h4>
              <div class="result-item">
                <span class="result-label">Basic Salary:</span>
                <span class="result-value">RM {{ calculation.basicSalary || 0 }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Overtime:</span>
                <span class="result-value">RM {{ calculation.overtimePay }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">Bonus:</span>
                <span class="result-value">RM {{ calculation.bonus || 0 }}</span>
              </div>
              <div class="result-item total">
                <span class="result-label">Gross Salary:</span>
                <span class="result-value">RM {{ calculation.grossSalary }}</span>
              </div>
            </div>

            <div class="result-section">
              <h4>Employee Deductions</h4>
              <div class="result-item">
                <span class="result-label">EPF (11%):</span>
                <span class="result-value">RM {{ calculation.epfEmployee }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">SOCSO:</span>
                <span class="result-value">RM {{ calculation.socso }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">EIS:</span>
                <span class="result-value">RM {{ calculation.eis }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">PCB:</span>
                <span class="result-value">RM {{ calculation.pcb }}</span>
              </div>
              <div class="result-item total">
                <span class="result-label">Total Deductions:</span>
                <span class="result-value">RM {{ calculation.totalDeductions }}</span>
              </div>
            </div>

            <div class="result-section final">
              <div class="result-item net-salary">
                <span class="result-label">Net Salary:</span>
                <span class="result-value">RM {{ calculation.netSalary }}</span>
              </div>
            </div>

            <div class="result-section">
              <h4>Employer Contributions</h4>
              <div class="result-item">
                <span class="result-label">EPF (13%):</span>
                <span class="result-value">RM {{ calculation.epfEmployer }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">SOCSO:</span>
                <span class="result-value">RM {{ calculation.socsoEmployer }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">EIS:</span>
                <span class="result-value">RM {{ calculation.eisEmployer }}</span>
              </div>
              <div class="result-item total">
                <span class="result-label">Total Employer Cost:</span>
                <span class="result-value">RM {{ calculation.totalEmployerCost }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Payslips -->
      <div class="payslips-section">
        <h2>Recent Payslips</h2>
        <div class="payslips-list">
          <div v-for="payslip in recentPayslips" :key="payslip.id" class="payslip-card">
            <div class="payslip-header">
              <h4>{{ payslip.employeeName }}</h4>
              <span class="payslip-period">{{ payslip.period }}</span>
            </div>
            <div class="payslip-details">
              <div class="payslip-amount">RM {{ payslip.netSalary.toLocaleString() }}</div>
              <div class="payslip-date">Paid: {{ payslip.paymentDate }}</div>
            </div>
            <button class="btn-small" @click="downloadPayslip(payslip)">Download</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployee" class="modal-overlay" @click="showAddEmployee = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Employee</h3>
          <button class="close-btn" @click="showAddEmployee = false">×</button>
        </div>
        <div class="modal-content">
          <div class="form-row">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" v-model="newEmployee.name" placeholder="Enter employee name">
            </div>
            <div class="form-group">
              <label>Position</label>
              <input type="text" v-model="newEmployee.position" placeholder="Enter position">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Basic Salary (RM)</label>
              <input type="number" v-model="newEmployee.salary" placeholder="Enter basic salary">
            </div>
            <div class="form-group">
              <label>EPF Number</label>
              <input type="text" v-model="newEmployee.epfNumber" placeholder="EPF number">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>SOCSO Number</label>
              <input type="text" v-model="newEmployee.socsoNumber" placeholder="SOCSO number">
            </div>
            <div class="form-group">
              <label>Tax Number</label>
              <input type="text" v-model="newEmployee.taxNumber" placeholder="Tax file number">
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showAddEmployee = false">Cancel</button>
          <button class="btn-primary" @click="addEmployee">Add Employee</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayrollCalculator',
  data() {
    return {
      showAddEmployee: false,
      selectedEmployeeId: null,
      newEmployee: {
        name: '',
        position: '',
        salary: 0,
        epfNumber: '',
        socsoNumber: '',
        taxNumber: ''
      },
      calculation: {
        basicSalary: 0,
        overtimeHours: 0,
        bonus: 0,
        overtimePay: 0,
        grossSalary: 0,
        epfEmployee: 0,
        epfEmployer: 0,
        socso: 0,
        socsoEmployer: 0,
        eis: 0,
        eisEmployer: 0,
        pcb: 0,
        totalDeductions: 0,
        netSalary: 0,
        totalEmployerCost: 0
      },
      employees: [
        {
          id: 1,
          name: 'Ahmad bin Ismail',
          position: 'Senior Consultant',
          salary: 6000,
          epfNumber: 'EPF123456',
          socsoNumber: 'SOCSO123456',
          taxNumber: 'TFN123456'
        },
        {
          id: 2,
          name: 'Siti Nurhaliza',
          position: 'Junior Consultant',
          salary: 3500,
          epfNumber: 'EPF654321',
          socsoNumber: 'SOCSO654321',
          taxNumber: 'TFN654321'
        },
        {
          id: 3,
          name: 'Raj Kumar',
          position: 'Marketing Executive',
          salary: 4200,
          epfNumber: 'EPF789012',
          socsoNumber: 'SOCSO789012',
          taxNumber: 'TFN789012'
        }
      ],
      recentPayslips: [
        {
          id: 1,
          employeeName: 'Ahmad bin Ismail',
          period: 'November 2025',
          netSalary: 5200,
          paymentDate: '2025-11-28'
        },
        {
          id: 2,
          employeeName: 'Siti Nurhaliza',
          period: 'November 2025',
          netSalary: 3050,
          paymentDate: '2025-11-28'
        },
        {
          id: 3,
          employeeName: 'Raj Kumar',
          period: 'November 2025',
          netSalary: 3800,
          paymentDate: '2025-11-28'
        }
      ]
    }
  },
  methods: {
    onEmployeeSelect() {
      const employee = this.employees.find(emp => emp.id === parseInt(this.selectedEmployeeId));
      if (employee) {
        this.calculation.basicSalary = employee.salary;
        this.calculatePayroll();
      }
    },
    calculatePayroll(employee = null) {
      if (employee) {
        this.calculation.basicSalary = employee.salary;
        this.selectedEmployeeId = employee.id;
        
        this.$root.showNotification(
          'Payroll Calculated',
          `Payroll calculation completed for ${employee.name}`,
          'success'
        );
      }

      const basic = parseFloat(this.calculation.basicSalary) || 0;
      const overtime = parseFloat(this.calculation.overtimeHours) || 0;
      const bonus = parseFloat(this.calculation.bonus) || 0;

      // Overtime calculation (1.5x hourly rate)
      const hourlyRate = basic / 160; // Assuming 160 working hours per month
      this.calculation.overtimePay = (overtime * hourlyRate * 1.5).toFixed(2);

      // Gross salary
      this.calculation.grossSalary = (basic + parseFloat(this.calculation.overtimePay) + bonus).toFixed(2);

      // Malaysia statutory calculations
      this.calculation.epfEmployee = (this.calculation.grossSalary * 0.11).toFixed(2);
      this.calculation.epfEmployer = (this.calculation.grossSalary * 0.13).toFixed(2);
      
      // Simplified SOCSO calculation
      this.calculation.socso = Math.min(this.calculation.grossSalary * 0.005, 9.15).toFixed(2);
      this.calculation.socsoEmployer = Math.min(this.calculation.grossSalary * 0.015, 13.40).toFixed(2);
      
      // Simplified EIS calculation
      this.calculation.eis = Math.min(this.calculation.grossSalary * 0.002, 2.94).toFixed(2);
      this.calculation.eisEmployer = Math.min(this.calculation.grossSalary * 0.002, 2.94).toFixed(2);
      
      // Simplified PCB (simulated)
      this.calculation.pcb = (basic > 5000 ? 200 : 0).toFixed(2);

      // Total deductions
      this.calculation.totalDeductions = (
        parseFloat(this.calculation.epfEmployee) +
        parseFloat(this.calculation.socso) +
        parseFloat(this.calculation.eis) +
        parseFloat(this.calculation.pcb)
      ).toFixed(2);

      // Net salary
      this.calculation.netSalary = (this.calculation.grossSalary - this.calculation.totalDeductions).toFixed(2);

      // Total employer cost
      this.calculation.totalEmployerCost = (
        parseFloat(this.calculation.grossSalary) +
        parseFloat(this.calculation.epfEmployer) +
        parseFloat(this.calculation.socsoEmployer) +
        parseFloat(this.calculation.eisEmployer)
      ).toFixed(2);
    },
    addEmployee() {
      // Validation
      if (!this.newEmployee.name) {
        this.$root.showNotification(
          'Missing Information',
          'Please enter employee name.',
          'error'
        );
        return;
      }

      if (!this.newEmployee.salary || this.newEmployee.salary <= 0) {
        this.$root.showNotification(
          'Invalid Salary',
          'Please enter a valid salary amount.',
          'error'
        );
        return;
      }

      const newEmp = {
        id: this.employees.length + 1,
        ...this.newEmployee,
        salary: parseFloat(this.newEmployee.salary)
      };
      this.employees.push(newEmp);
      this.showAddEmployee = false;
      this.resetNewEmployee();
      
      this.$root.showNotification(
        'Employee Added',
        `${newEmp.name} has been added to the payroll system.`,
        'success'
      );
    },
    resetNewEmployee() {
      this.newEmployee = {
        name: '',
        position: '',
        salary: 0,
        epfNumber: '',
        socsoNumber: '',
        taxNumber: ''
      };
    },
    viewPayslip(employee) {
      this.$root.showNotification(
        'Payslip Generated',
        `Payslip for ${employee.name} has been generated.`,
        'success'
      );
    },
    downloadPayslip(payslip) {
      this.$root.showNotification(
        'Payslip Downloaded',
        `Payslip for ${payslip.employeeName} (${payslip.period}) has been downloaded.`,
        'success'
      );
    },
    generatePayrollReport() {
      this.$root.showNotification(
        'Payroll Report',
        'Payroll report has been generated for all employees.',
        'success'
      );
    },
    processBulkPayments() {
      this.$root.showNotification(
        'Bulk Payments Processed',
        'Salary payments have been processed for all employees.',
        'success'
      );
    }
  },
  mounted() {
    // Auto-select first employee
    if (this.employees.length > 0) {
      this.selectedEmployeeId = this.employees[0].id;
      this.onEmployeeSelect();
    }
  }
}
</script>

<style scoped>
.payroll-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
  width: 100%;
  max-width: 100%;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
  word-wrap: break-word;
}

.page-header p {
  color: #718096;
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  word-wrap: break-word;
}

.demo-banner {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.demo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Fixed Grid Layout */
.payroll-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  grid-template-areas: 
    "employees calculator"
    "payslips calculator";
}

.employees-section {
  grid-area: employees;
  width: 100%;
  max-width: 100%;
}

.calculator-section {
  grid-area: calculator;
  width: 100%;
  max-width: 100%;
}

.payslips-section {
  grid-area: payslips;
  width: 100%;
  max-width: 100%;
}

.employees-section h2,
.calculator-section h2,
.payslips-section h2 {
  margin-bottom: 1rem;
  color: #2d3748;
  word-wrap: break-word;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.4);
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.employee-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.employee-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.employee-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

.employee-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-width: 0;
}

.employee-info p {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.9rem;
  word-wrap: break-word;
}

.employee-salary {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  word-wrap: break-word;
}

.employee-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-small:hover {
  background: #f7fafc;
}

.btn-small.primary {
  background: #2c5aa0;
  color: white;
  border-color: #2c5aa0;
}

.btn-small.primary:hover {
  background: #1e3a8a;
}

/* Payroll Calculator Styles */
.calculator {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: 800px;
  overflow-y: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.calc-inputs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  word-wrap: break-word;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.calc-results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.calc-results h3 {
  margin: 0;
  color: #2d3748;
  border-bottom: 2px solid #e1e5e9;
  padding-bottom: 0.5rem;
  word-wrap: break-word;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 100%;
}

.result-section h4 {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  word-wrap: break-word;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f7fafc;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.result-label {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-value {
  color: #2d3748;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowarp;
}

.result-item.total {
  border-top: 2px solid #e1e5e9;
  border-bottom: none;
  padding-top: 0.75rem;
  font-weight: 600;
  color: #2d3748;
}

.result-section.final {
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.net-salary {
  font-size: 1.1rem;
  font-weight: 700;
}

.result-section.final .result-label,
.result-section.final .result-value {
  color: white;
}

/* Payslips Section */
.payslips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.payslip-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.payslip-header h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  word-wrap: break-word;
}

.payslip-period {
  color: #718096;
  font-size: 0.8rem;
  word-wrap: break-word;
}

.payslip-details {
  text-align: right;
}

.payslip-amount {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
  word-wrap: break-word;
}

.payslip-date {
  color: #718096;
  font-size: 0.8rem;
  word-wrap: break-word;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  word-wrap: break-word;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-content {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

/* Fix for long numbers */
.result-value {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}

/* Enhanced Responsive Design */
@media (max-width: 1024px) {
  .payroll-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: 
      "employees"
      "calculator"
      "payslips";
    gap: 1.5rem;
  }

  .calculator {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .payroll-page {
    padding: 0.75rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .payroll-grid {
    gap: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .calculator {
    padding: 1.25rem;
    max-height: none;
  }

  .employee-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .employee-actions {
    width: 100%;
    justify-content: center;
  }

  .payslip-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }

  .payslip-details {
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    margin: 0;
    max-height: 95vh;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .payroll-page {
    padding: 0.5rem;
  }

  .calculator {
    padding: 1rem;
    gap: 1.25rem;
  }

  .employee-card {
    padding: 1rem;
  }

  .payslip-card {
    padding: 1rem;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-content {
    padding: 1.25rem;
  }

  .modal-actions {
    padding: 1.25rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .result-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
    text-align: center;
  }

  .result-label,
  .result-value {
    white-space: normal;
    text-overflow: clip;
    overflow: visible;
  }

  .result-label {
    font-size: 0.8rem;
  }

  .result-value {
    font-size: 0.9rem;
    font-weight: 700;
  }
}

/* Critical overflow prevention */
@media (max-width: 400px) {
  .payroll-page {
    padding: 0.25rem;
  }
  
  .employee-card,
  .calculator,
  .payslip-card {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
}

/* Print Styles */
@media print {
  .demo-banner,
  .btn-primary,
  .btn-small,
  .modal-overlay {
    display: none !important;
  }

  .payroll-grid {
    grid-template-columns: 1fr;
  }

  .employee-card,
  .calculator,
  .payslip-card {
    box-shadow: none;
    border: 1px solid #000;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .employee-card:hover,
  .btn-primary:hover,
  .btn-small:hover {
    transform: none;
  }
  
  .employee-card:active,
  .btn-primary:active {
    transform: scale(0.98);
  }
}

/* Scrollbar styling for calculator */
.calculator::-webkit-scrollbar {
  width: 6px;
}

.calculator::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.calculator::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.calculator::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>