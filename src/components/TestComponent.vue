<template>
  <div>test page</div>
</template>

<script lang="ts" setup>
import { useReviewsApi } from 'src/composables/reviews/useReviewsApi';
const { reviews, pagination, loading, listReviews } = useReviewsApi();

console.log('Reviews:', reviews);
console.log('Pagination:', pagination);
console.log('Loading:', loading);
console.log('List Reviews:', listReviews);
</script>
