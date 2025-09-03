import arrow from "../assets/icons/arrow.png";
import {Link} from "react-router-dom";

const Button = ({
                  text,
                  isTransparent,
                  border,
                  icon,
                  className,
                  href,
                  CustomIcon,
                  onClick,
                  type,
                  disabled,
                  CustomIconLeft
                }) => {
  const baseClasses = `
    ${isTransparent ? 'bg-transparent text-white/50 font-roboto-mono' : 'bg-dark-12 border-none font-roboto-mono text-white'}
    !px-4 h-[49px] rounded-lg text-[16px]
    border-2 border-dashed
    ${border && isTransparent ? "border-dark-15" : "border-brown-60 "}
    flex items-center justify-center
    transition-all duration-300 ease-in-out
    active:scale-95
    hover:scale-103
    ${icon ? 'gap-2' : ''}
    ${isTransparent ? 'hover:bg-dark-08 hover:text-white hover:border-dark-25' : 'hover:bg-dark-12'}
    ${className ?? ''}
  `;

  const content = (
    <>
      {
        CustomIconLeft && <CustomIconLeft className="!h-[16px] !w-[16px]" />
      }
      {text}
      {icon && (
        <img
          src={arrow}
          alt="arrow icon"
          className={`!h-[16px] !w-[16px] ${isTransparent ? "invert" : ''}`}
        />
      )}
      {CustomIcon && <CustomIcon className="!h-[16px] !w-[16px]" />}
    </>
  );

  return href ? (
    <Link
      to={href}
      className={baseClasses}
      onClick={onClick}
    >
      {content}
    </Link>
  ) : (
    <button
      type={type}
      disabled={disabled}
      className={baseClasses}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default Button;
