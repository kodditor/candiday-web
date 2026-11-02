/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class', '[data-mode="dark"]'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				ink: 'var(--pv-ink)',
				paper: {
					DEFAULT: 'var(--pv-paper)',
					raised: 'var(--pv-paper-raised)',
				},
				hairline: 'var(--pv-hairline)',
				statute: {
					DEFAULT: 'var(--pv-statute)',
					hover: 'var(--pv-statute-hover)',
				},
				risk: {
					low: 'var(--pv-risk-low)',
					'low-bg': 'var(--pv-risk-low-bg)',
					medium: 'var(--pv-risk-medium)',
					'medium-bg': 'var(--pv-risk-medium-bg)',
					high: 'var(--pv-risk-high)',
					'high-bg': 'var(--pv-risk-high-bg)',
				},
				text: {
					primary: 'var(--pv-text-primary)',
					secondary: 'var(--pv-text-secondary)',
					muted: 'var(--pv-text-muted)',
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
				},
				sidebar: {
					DEFAULT: 'var(--sidebar-background)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				}
			},
			fontFamily: {
				sans: ['var(--font-body)'],
				display: ['var(--font-display)'],
				body: ['var(--font-body)'],
				mono: ['var(--font-mono)'],
			},
			borderRadius: {
				sm: 'var(--pv-radius-sm)',
				md: 'var(--pv-radius-md)',
				lg: 'var(--pv-radius-lg)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'sheet-in': {
					from: {
						transform: 'translateY(100%)',
						opacity: '0',
					},
					to: {
						transform: 'translateY(0)',
						opacity: '1',
					},
				},
				'sheet-out': {
					from: {
						transform: 'translateY(0)',
						opacity: '1',
					},
					to: {
						transform: 'translateY(100%)',
						opacity: '0',
					},
				},
				'overlay-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'overlay-out': {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'sheet-in': 'sheet-in 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards',
				'sheet-out': 'sheet-out 0.24s cubic-bezier(0.32, 0.72, 0, 1) forwards',
				'overlay-in': 'overlay-in 0.28s ease-out forwards',
				'overlay-out': 'overlay-out 0.2s ease-in forwards',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
