import * as React from "react";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "icon";

const variantClass: Record<ButtonVariant, string> = {
  default: "bg-slate-100 text-slate-900 hover:bg-white",
  outline: "border border-slate-600/70 bg-slate-900/80 text-slate-100 hover:border-slate-400 hover:bg-slate-800",
  ghost: "bg-transparent text-slate-100 hover:bg-slate-800/70",
};

const sizeClass: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  icon: "h-11 w-11 p-0",
};

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "inline-flex items-center justify-center rounded-xl font-semibold shadow-sm backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
});
