import { ref } from "vue";

const isDark = ref(true);

export function useTheme() {
	function initTheme() {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "light") {
			isDark.value = false;
			document.documentElement.classList.remove("dark");
		} else {
			isDark.value = true;
			document.documentElement.classList.add("dark");
		}
	}

	function toggleTheme() {
		isDark.value = !isDark.value;
		if (isDark.value) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}

	return {
		isDark,
		initTheme,
		toggleTheme,
	};
}
