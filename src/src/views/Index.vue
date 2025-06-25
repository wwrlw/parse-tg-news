<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <StatsCards 
        v-if="!loading || posts.length > 0"
        :posts="posts" />

      <Filters 
        :loading="loading" 
        :posts="posts"
        @update:searchQuery="searchQuery = $event"
        @update:statusFilter="statusFilter = $event" />

      <PostTableSkeleton v-if="loading && posts.length === 0" :item-count="10" />

      <PostsTable 
        v-else
        :filtered-posts="filteredPosts"
        :loading="loading"
        :selected-posts="selectedPosts"
        @update:selectedPosts="selectedPosts = $event"
        @publish="publishPost"
        @delete="deletePost" />

      <Actions 
        :selected-posts="selectedPosts"
        @bulk-publish="bulkPublish"
        @bulk-delete="bulkDelete"
        @clear-selection="clearSelection" />

      <PublishModal 
        v-model:show="showPublishModal"
        :initial-message="publishMessage"
        @submit="submitPublish" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from "vue";
import http from '@/js/http';
import PostTableSkeleton from '@/components/PostTableSkeleton.vue';
import StatsCards from '@/components/StatsCards.vue';
import Filters from '@/components/Filters.vue';
import PostsTable from '@/components/PostsTable.vue';
import Actions from '@/components/Actions.vue';
import PublishModal from '@/components/PublishModal.vue';

// Получаем состояния из App.vue
const globalLoading = inject('loading');
const refreshTrigger = inject('refreshTrigger');
const setLoading = inject('setLoading');

const posts = ref([]);
const searchQuery = ref('');
const statusFilter = ref('');
const selectedPosts = ref([]);
const showPublishModal = ref(false);
const publishMessage = ref('');
const loading = ref(false);

const postsService = async () => {
  loading.value = true;
  if (setLoading) setLoading(true);
  
  try {
    return new Promise((resolve, reject) => {
      http.posts((res) => {
        posts.value = res.data || [];
        loading.value = false;
        if (setLoading) setLoading(false);
        resolve(res.data);
      }, (err) => {
        console.error('Error loading posts:', err);
        loading.value = false;
        if (setLoading) setLoading(false);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error loading posts:', error);
    loading.value = false;
    if (setLoading) setLoading(false);
    throw error;
  }
};

const filteredPosts = computed(() => {
  let filtered = posts.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(post => 
      post.text.toLowerCase().includes(query) ||
      (post.source_channel && post.source_channel.toLowerCase().includes(query))
    );
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(post => {
      if (statusFilter.value === 'unique') return post.is_unique;
      if (statusFilter.value === 'duplicate') return !post.is_unique;
      return true;
    });
  }
  
  return filtered;
});

const publishPost = async (post) => {
  try {
    const response = await http.post(`/post/${post._id}/publish`);
    
    if (response.success) {
      alert('Пост успешно опубликован в Telegram канал!');
    } else {
      alert('Ошибка при публикации: ' + response.message);
    }
  } catch (error) {
    console.error('Error publishing post:', error);
    alert('Ошибка при публикации поста');
  }
};

const bulkPublish = () => {
  if (selectedPosts.value.length > 0) {
    const selectedTexts = posts.value
      .filter(post => selectedPosts.value.includes(post._id))
      .map(post => post.text)
      .join('\n\n---\n\n');
    
    publishMessage.value = selectedTexts;
    showPublishModal.value = true;
  }
};

const submitPublish = (formData) => {
  console.log('Publishing to:', formData.channel);
  console.log('Message:', formData.message);
  
  clearSelection();
  
  alert('Сообщение опубликовано!');
};

const deletePost = (postId) => {
  if (confirm('Вы уверены, что хотите удалить этот пост?')) {
    console.log('Deleting post:', postId);
    posts.value = posts.value.filter(post => post._id !== postId);
  }
};

const bulkDelete = () => {
  if (confirm(`Вы уверены, что хотите удалить ${selectedPosts.value.length} постов?`)) {
    posts.value = posts.value.filter(post => !selectedPosts.value.includes(post._id));
    clearSelection();
  }
};

const clearSelection = () => {
  selectedPosts.value = [];
};

watch(refreshTrigger, () => {
  if (refreshTrigger && refreshTrigger.value > 0) {
    postsService();
  }
});

onMounted(() => {
  postsService();
});
</script>