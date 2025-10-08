<template>
  <q-page class="row items-center justify-center q-pa-lg">
    <q-card class="q-pa-md" style="min-width: 320px; max-width: 420px; width: 100%" flat>
      <q-card-section class="row">
        <div class="col-12 text-center">
          <q-img src="~assets/logo.jpg" alt="Logo" width="100px" />
        </div>
        <div class="col-12 text-center">
          <div class="text-h6">Iniciar sesión</div>
        </div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input v-model="email" type="email" label="Email" outlined dense />
        <q-input
          v-model="password"
          :type="showPass ? 'text' : 'password'"
          label="Contraseña"
          outlined
          dense
        >
          <template #append>
            <q-icon
              :name="showPass ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPass = !showPass"
            />
          </template>
        </q-input>
        <q-banner v-if="error" class="bg-red-2 text-negative" dense>{{ error }}</q-banner>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn color="primary" label="Entrar" @click="onLogin" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLogin } from 'src/composables/auth/useLogin';

const { email, password, error, onLogin } = useLogin();
const showPass = ref(false);
</script>
