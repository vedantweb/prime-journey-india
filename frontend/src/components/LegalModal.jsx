import Modal from './Modal';
import { legal } from '../data/company';
import { useUI } from '../context/UIContext';

export default function LegalModal() {
  const { legalDoc, closeLegal } = useUI();
  const doc = legalDoc ? legal[legalDoc] : null;
  return (
    <Modal open={!!doc} onClose={closeLegal} testid="legal-modal">
      {doc && (
        <div className="p-7 sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-saffron">Prime Journey India</p>
          <h3 className="mt-2 font-display text-2xl font-extrabold text-ocean">{doc.title}</h3>
          <p data-testid="legal-body" className="mt-4 text-sm leading-relaxed text-ink/70">{doc.body}</p>
        </div>
      )}
    </Modal>
  );
}
