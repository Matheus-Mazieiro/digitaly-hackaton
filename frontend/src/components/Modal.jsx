export default function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}