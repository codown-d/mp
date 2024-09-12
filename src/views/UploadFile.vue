<template>
  <div style="width: 300px">
<!--    <input type="file" @change="handleFileUpload"  accept=".csv">-->
<!--    <input type="file" @change="handleFileUpload2"  accept=".csv">-->
    <input type="file" @change="handleFileUpload1"  accept=".csv">
    <input type="file" @change="handleFileUpload3"  accept=".csv">
  </div>
</template>

<script>

export default {
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.uploadFile(file);
    },
    handleFileUpload1(event) {
      const file = event.target.files[0];
      this.uploadFile1(file);
    },
    handleFileUpload2(event) {
      const file = event.target.files[0];
      this.uploadFile2(file);
    },
    handleFileUpload3(event) {
      const file = event.target.files[0];
      this.uploadFile3(file);
    },
    uploadFile1(file) {
      const formData = new FormData();
      formData.append('file', file);

      this.$axios.post('/userapi/upload_emb/', formData)
          .then(response => {
          })
    },
    uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);

      this.$axios.post('/userapi/upload_emb1/', formData)
          .then(response => {
          })
    },
    uploadFile2(file) {
      const formData = new FormData();
      formData.append('file', file);

      this.$axios.post('/userapi/upload_emb2/', formData)
          .then(response => {
          })
    },
    uploadFile3(file) {
      const formData = new FormData();
      formData.append('file', file);

      this.$axios.post('/userapi/upload_adj/', formData)
          .then(response => {
          })
    },
  }
}
</script>