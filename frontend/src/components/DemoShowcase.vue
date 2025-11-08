<template>
  <div class="demo-showcase">
    <div class="hero-section">
      <h1>🚀 BizFlow ERP Demo</h1>
      <p>Experience modern business management for Malaysian SMEs</p>
    </div>
    
    <div class="demo-scenarios">
      <h2>Quick Demos</h2>
      <div class="scenario-grid">
        <div class="scenario-card" @click="startDemo('quickInvoice')">
          <h3>📊 Quick Invoice</h3>
          <p>Create professional invoices with SST compliance</p>
          <button>Start Demo</button>
        </div>
        
        <div class="scenario-card" @click="startDemo('compliance')">
          <h3>📋 SST Compliance</h3>
          <p>Malaysia sales & service tax management</p>
          <button>Start Demo</button>
        </div>
        
        <div class="scenario-card" @click="startDemo('payroll')">
          <h3>💰 Payroll</h3>
          <p>Calculate salaries with EPF, SOCSO, EIS</p>
          <button>Start Demo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DemoShowcase',
  methods: {
    startDemo(scenario) {
      this.$emit('start-demo', scenario);
    }
  },
  emits: ['start-demo']
}
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: -2rem -2rem 2rem -2rem;
  padding: 4rem 2rem;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.demo-scenarios {
  max-width: 1200px;
  margin: 0 auto;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.scenario-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.scenario-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.scenario-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.scenario-card button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>