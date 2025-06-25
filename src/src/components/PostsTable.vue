<template>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Посты ({{ pagination.total }})</h3>
            <div class="flex items-center space-x-2">
              <label class="text-sm text-gray-500">Показать:</label>
              <select v-model="itemsPerPage" 
                      class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" 
                           v-model="selectAll" 
                           @change="toggleSelectAll"
                           class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контент
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Источник
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="post in paginatedPosts" 
                    :key="post._id"
                    :class="{ 'bg-blue-50': selectedPosts.includes(post._id) }"
                    class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" 
                           :value="post._id"
                           v-model="selectedPosts"
                           class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-start space-x-3">
                      <div v-if="post.media" class="flex-shrink-0">
                        <LazyImage 
                          v-if="post.media.type === 'MessageMediaPhoto'" 
                          :src="getMediaPath(post.media.file_path)"
                          alt="Post media" 
                          container-class="h-12 w-12 rounded-lg"
                          image-class="h-12 w-12 rounded-lg object-cover"
                          placeholder-class="h-12 w-12 rounded-lg" />
                        <div v-else 
                             class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ extractTitle(post.text) }}
                        </p>
                        <p class="text-sm text-gray-500 line-clamp-2">
                          {{ truncateText(post.text, 120) }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a :href="post.url" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="text-sm text-indigo-600 hover:text-indigo-900">{{ post.source_channel || 'Не указан' }}</a>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <time :datetime="post.timestamp">{{ formatDate(post.timestamp) }}</time>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      post.is_unique 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    ]">
                      <svg :class="[
                        'mr-1.5 h-2 w-2',
                        post.is_unique ? 'text-green-400' : 'text-yellow-400'
                      ]" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      {{ post.is_unique ? 'Уникальный' : 'Оригинальный' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2 gap-2">
                      <router-link :to="{ name: 'post', params: { id: post._id } }"
                                   class="text-indigo-600 hover:text-indigo-900 text-sm">
                        Просмотр
                      </router-link>
                      <button @click="$emit('publish', post)" 
                              class="text-green-600 hover:text-green-900 text-sm">
                        Опубликовать
                      </button>
                      <button @click="$emit('delete', post._id)" 
                              class="text-red-600 hover:text-red-900 text-sm">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="posts.length === 0 && !loading" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Нет постов</h3>
            <p class="mt-1 text-sm text-gray-500">Попробуйте изменить фильтры или добавить новые посты.</p>
          </div>

          <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button @click="prevPage" 
                      :disabled="currentPage === 1"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Назад
              </button>
              <button @click="nextPage" 
                      :disabled="currentPage === totalPages"
                      class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Вперед
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Показано с 
                  <span class="font-medium">{{ startItem }}</span>
                  по 
                  <span class="font-medium">{{ endItem }}</span>
                  из 
                  <span class="font-medium">{{ pagination.total }}</span>
                  результатов
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button @click="prevPage" 
                          :disabled="currentPage === 1"
                          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span class="sr-only">Назад</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  <button v-for="page in visiblePages" 
                          :key="page"
                          @click="goToPage(page)"
                          :disabled="page === '...'"
                          :class="[
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                            page === currentPage 
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : page === '...'
                              ? 'bg-white border-gray-300 text-gray-300 cursor-default'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          ]">
                    {{ page }}
                  </button>
                  
                  <button @click="nextPage" 
                          :disabled="currentPage === totalPages"
                          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span class="sr-only">Вперед</span>
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LazyImage from '@/components/LazyImage.vue'

const props = defineProps({
  posts: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedPosts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedPosts', 'publish', 'delete', 'page-change', 'items-per-page-change'])

const selectAll = ref(false)

const selectedPosts = computed({
  get: () => props.selectedPosts,
  set: (value) => emit('update:selectedPosts', value)
})

const currentPage = computed(() => props.pagination.page)
const totalPages = computed(() => props.pagination.totalPages)
const itemsPerPage = computed({
  get: () => props.pagination.limit,
  set: (value) => emit('items-per-page-change', parseInt(value))
})

const paginatedPosts = computed(() => props.posts)

const startItem = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, props.pagination.total)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const extractTitle = (text) => {
  const firstSentence = text.split('\n\n')[0]
  return firstSentence.length > 80 ? firstSentence.substring(0, 80) + '...' : firstSentence
}

const truncateText = (text, length) => {
  if (text.length > length) {
    return text.substring(0, length) + '...'
  }
  return text
}

const getMediaPath = (filePath) => {
  return `/api/media${filePath.split('/media').pop()}`
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedPosts.value = paginatedPosts.value.map(post => post._id)
  } else {
    selectedPosts.value = []
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    emit('page-change', currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    emit('page-change', currentPage.value + 1)
  }
}

const goToPage = (page) => {
  if (page !== '...' && page >= 1 && page <= totalPages.value) {
    emit('page-change', page)
  }
}

watch(selectedPosts, () => {
  selectAll.value = selectedPosts.value.length === paginatedPosts.value.length && paginatedPosts.value.length > 0
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>