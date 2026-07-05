import * as Dialog from "@radix-ui/react-dialog";
import "./Modal.css";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal__overlay" />
        <Dialog.Content className="modal__content">
          <Dialog.Title className="modal__title">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="modal__description">
              {description}
            </Dialog.Description>
          )}
          <div className="modal__body">{children}</div>
          <Dialog.Close asChild>
            <button className="modal__close" aria-label="Close">
              &times;
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <div className="modal__footer">{children}</div>;
}
