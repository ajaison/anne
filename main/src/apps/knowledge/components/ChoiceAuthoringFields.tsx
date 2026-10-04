interface Props {
  distractors: string[];
  explanation: string;
  onDistractors: (values: string[]) => void;
  onExplanation: (value: string) => void;
  disabled?: boolean;
}

export default function ChoiceAuthoringFields({ distractors, explanation, onDistractors, onExplanation, disabled }: Props) {
  return (
    <fieldset className="choice-authoring" disabled={disabled}>
      <legend>Multiple-choice options</legend>
      <p>Write three believable alternatives with similar length, detail, and style to the correct answer.</p>
      {[0, 1, 2].map(index => (
        <label key={index}>
          Wrong answer {index + 1}
          <textarea className="qa-textarea" value={distractors[index] ?? ''} rows={2} required
            onChange={event => onDistractors(distractors.map((value, i) => i === index ? event.target.value : value))} />
        </label>
      ))}
      <label>
        Explanation (shown after selection)
        <textarea className="qa-textarea" value={explanation} rows={4} placeholder="Explain the correct answer and why the alternatives are wrong."
          onChange={event => onExplanation(event.target.value)} />
      </label>
    </fieldset>
  );
}
