<template>
  <div>
    <input type="file" @change="handleFileChange"/>
    {{this.list[0]}}
  </div>
</template>

<script>
import Papa from 'papaparse'

export default {
  data() {
    return {
      list: [],
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      Papa.parse(file, {
        complete: (results) => {
          this.list = results.data[0];
         // this.list.push(results.data)
        }
      })
    }
  }
}
</script>