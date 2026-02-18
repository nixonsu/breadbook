import classNames from "classnames";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const Card = ({ children, className, onClick }: ContainerProps) => {
  return (
    <div
      className={classNames(
        "w-72 md:w-80 px-8 py-4 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] place-content-center",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
