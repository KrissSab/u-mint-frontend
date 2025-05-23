<template>
  <button :class="buttonClasses" :type="type" @click="$emit('click')">
    <slot />
  </button>
</template>

<script lang="ts">
export default {
  props: {
    type: {
      type: String,
      default: "button",
      validator: (value: string) =>
        ["button", "submit", "reset"].includes(value),
    },
    variant: {
      type: String,
      default: "primary",
      validator: (value: string) =>
        [
          "primary",
          "secondary",
          "navigation",
          "profile",
          "success",
          "danger",
          "warning",
          "info",
        ].includes(value),
    },
    size: {
      type: String,
      default: "md",
      validator: (value: string) => ["sm", "md", "lg"].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    buttonClasses() {
      return [
        "the-button",
        `the-button--${this.variant}`,
        `the-button--${this.size}`,
        { "the-button--disabled": this.disabled },
      ];
    },
  },
};
</script>

<style scoped>
.the-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out;
}

.the-button--primary {
  background-color: var(--primary-color);
  color: var(--light-text-color);
}

.the-button--secondary {
  background-color: var(--secondary-color);
  color: var(--light-text-color);
}

.the-button--profile {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  min-width: 48px;
  height: 48px;
  background-color: rgba(102, 51, 153, 0.2);
  color: var(--light-text-color);
  border-radius: 0.75rem;
  gap: 0.5rem;
}

.the-button--navigation {
  background-color: transparent;
  color: var(--primary-light);
}

.the-button--success {
  background-color: var(--success-color);
  color: var(--light-text-color);
}

.the-button--danger {
  background-color: var(--error-color);
  color: var(--light-text-color);
}

.the-button--warning {
  background-color: var(--warning-color);
  color: var(--text-color);
}

.the-button--info {
  background-color: var(--info-color);
  color: var(--light-text-color);
}

.the-button--sm {
  font-size: large;
  font-weight: 600;
}
.the-button--md {
  font-size: large;
  font-weight: 600;
}

.the-button--lg {
  font-size: x-large;
  font-weight: 700;
}

.the-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.the-button:hover {
  opacity: 0.8;
}
</style>
