import React from 'react';

export function StyledForm({
  title,
  buttonText,
  fields,
  onSubmit
}: {
  title: string;
  buttonText: string;
  fields: Array<{
    label: string;
    name: string;
    type: 'text' | 'email' | 'password' | 'textarea' | 'select';
    icon?: string;
    required?: boolean;
    rows?: number;
    options?: Array<{ label: string; value: string }>;
    autocomplete?: string;
  }>;
  onSubmit?: (formData: Record<string, any>, event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [formState, setFormState] = React.useState(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => { initial[field.name] = ''; });
    return initial;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (event) event.stopPropagation();
    // Never allow default browser submission
    if (onSubmit) {
      onSubmit(formState, event);
    }
    return false;
  };
  return (
    <form
      style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(20,40,80,0.97)',
        borderRadius: '18px',
        boxShadow: '0 0 24px #0ff8',
        border: '2px solid #7ecfff',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
        margin: '0 auto',
      }}
      onSubmit={handleSubmit}
    >
      {title && (
        <h2 style={{ color: '#7ecfff', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>{title}</h2>
      )}
      {fields.map((field, idx) => (
        <label key={field.name} style={{ width: '100%', color: '#7ecfff', fontWeight: 600 }}>
          {field.icon && <span role="img" aria-label={field.name} style={{ marginRight: '0.3rem' }}>{field.icon}</span>}
          {field.label}
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              rows={field.rows || 2}
              required={field.required}
              value={formState[field.name]}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #7ecfff', marginTop: '0.3rem', fontSize: '1.05rem', background: '#0a1a2f', color: '#fff', resize: 'vertical', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => (e.target.style.border = '2px solid #ffe600')}
              onBlur={e => (e.target.style.border = '2px solid #7ecfff')}
            />
          ) : field.type === 'password' ? (
            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box', marginTop: '0.3rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name={field.name}
                  required={field.required}
                  value={formState[field.name]}
                  onChange={handleChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 2.5rem 0.8rem 0.8rem', borderRadius: '8px', border: '2px solid #7ecfff', fontSize: '1.05rem', background: '#0a1a2f', color: '#fff', outline: 'none', transition: 'border 0.2s', display: 'block' }}
                  onFocus={e => (e.target.style.border = '2px solid #ffe600')}
                  onBlur={e => (e.target.style.border = '2px solid #7ecfff')}
                  autoComplete={field.autocomplete || (field.name.toLowerCase().includes('password') ? 'current-password' : undefined)}
                />
              <span
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1.3rem', color: showPassword ? '#ffe600' : '#7ecfff', userSelect: 'none', background: 'transparent', padding: 0 }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          ) : field.type === 'select' ? (
            <select
                name={field.name}
                required={field.required}
                value={formState[field.name]}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '2px solid #7ecfff', fontSize: '1rem', marginTop: '0.5rem', background: '#0a1a2f', color: '#fff' }}
                autoComplete={field.autocomplete || (field.name.toLowerCase().includes('role') ? 'organization-title' : undefined)}
            >
              <option value="">Select role...</option>
              {field.options && field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box', marginTop: '0.3rem' }}>
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                value={formState[field.name]}
                onChange={handleChange}
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 2.5rem 0.8rem 0.8rem', borderRadius: '8px', border: '2px solid #7ecfff', fontSize: '1.05rem', background: '#0a1a2f', color: '#fff', outline: 'none', transition: 'border 0.2s', display: 'block' }}
                onFocus={e => (e.target.style.border = '2px solid #ffe600')}
                onBlur={e => (e.target.style.border = '2px solid #7ecfff')}
                autoComplete={field.autocomplete || (field.name.toLowerCase().includes('name') ? 'name' : field.name.toLowerCase().includes('email') ? 'email' : undefined)}
              />
              {field.icon && (
                <span
                  style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.3rem', color: '#7ecfff', userSelect: 'none', background: 'transparent', padding: 0 }}
                  title={field.label}
                >
                  {field.icon}
                </span>
              )}
            </div>
          )}
        </label>
      ))}
      <button type="submit" style={{ background: '#7ecfff', color: '#183d5c', fontWeight: 700, borderRadius: '8px', padding: '0.8rem 2.2rem', fontSize: '1.1rem', border: 'none', boxShadow: '0 0 8px #0ff8', cursor: 'pointer', marginTop: '0.5rem' }}>{buttonText}</button>
    </form>
  );
}
