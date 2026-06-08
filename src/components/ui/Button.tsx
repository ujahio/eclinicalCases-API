import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-100 flex items-center relative font-medium group",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_10%)] text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_18%)] aria-expanded:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_10%)] aria-expanded:text-secondary-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
				destructive:
					"bg-rose-500 text-white hover:bg-rose-600 focus-visible:border-rose-400 focus-visible:ring-rose-200 dark:bg-rose-600 dark:hover:bg-rose-700",
				link: "text-primary underline-offset-4 hover:underline",
				basic:
					"bg-dark text-white hover:bg-primary-300 hover:shadow-primary-btn",
				outline:
					"text-dark border-0.375 border-grey-200 bg-grey-200 bg-opacity-0 hover:bg-opacity-10",
				"outline-white":
					"bg-white text-dark border border-grey-200 hover:bg-grey-100",
				white: "bg-white text-dark bg-opacity-100 hover:bg-opacity-90",
			},
			size: {
				default:
					"h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7.5 sm:h-8.75 px-3 sm:px-4.5 text-xs",
				md: "h-8 sm:h-10 px-5 sm:px-6 text-1xs",
				lg: "h-10 sm:h-12.5 px-6 sm:px-7.5 text-1xs",
				icon: "size-8",
				"icon-xs":
					"size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
				"icon-sm":
					"size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
				"icon-lg": "size-9",
			},
			centralize: {
				true: "justify-center",
				false: "justify-between",
			},
			block: {
				true: "w-full",
			},
			uppercase: {
				true: "uppercase",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			centralize: false,
			block: false,
			uppercase: false,
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	centralize = false,
	block = false,
	uppercase = false,
	href,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		href?: string;
	}) {
	const classes = cn(
		buttonVariants({ variant, size, centralize, block, uppercase, className }),
	);

	if (href) {
		return (
			<Link href={href} className={classes}>
				{props.children}
			</Link>
		);
	}

	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={classes}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
