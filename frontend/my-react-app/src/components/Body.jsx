import { useEffect, useState } from 'react';
import axios from 'axios';

const initialForm = { name: '', breed: '', weight_lbs: '', vaccinated: false };

const Body = () => {
	const [puppies, setPuppies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [form, setForm] = useState(initialForm);
	const [editingId, setEditingId] = useState(null);
	const [editRow, setEditRow] = useState(initialForm);

	const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

		useEffect(() => {
			(async () => {
				setLoading(true);
				setError('');
				try {
					const { data } = await axios.get(`${API_BASE}/puppies`);
					setPuppies(data);
				} catch (e) {
					setError(e?.response?.data?.error || e.message || 'Failed to load puppies');
				} finally {
					setLoading(false);
				}
			})();
		}, [API_BASE]);

	async function addPuppy(e) {
		e.preventDefault();
		if (!form.name.trim()) return setError('Name is required');
		try {
			const payload = {
				name: form.name.trim(),
				breed: form.breed || null,
				weight_lbs: form.weight_lbs ? Number(form.weight_lbs) : null,
				vaccinated: !!form.vaccinated,
			};
			const { data } = await axios.post(`${API_BASE}/puppies`, payload);
			setPuppies(prev => [...prev, data]);
			setForm(initialForm);
			setError('');
		} catch (e) {
			setError(e?.response?.data?.error || e.message || 'Failed to add puppy');
		}
	}

	if (loading) return <p style={{ padding: 16 }}>Loading...</p>;

		function startEdit(p) {
			setEditingId(p.id);
			setEditRow({
				name: p.name || '',
				breed: p.breed || '',
				weight_lbs: p.weight_lbs ?? '',
				vaccinated: !!p.vaccinated,
			});
		}

		function cancelEdit() {
			setEditingId(null);
			setEditRow(initialForm);
		}

		async function saveEdit(id) {
			try {
				const payload = {
					name: editRow.name.trim(),
					breed: editRow.breed || null,
					weight_lbs: editRow.weight_lbs !== '' ? Number(editRow.weight_lbs) : null,
					vaccinated: !!editRow.vaccinated,
				};
				const { data } = await axios.put(`${API_BASE}/puppies/${id}`, payload);
				setPuppies(prev => prev.map(p => (p.id === id ? data : p)));
				cancelEdit();
				setError('');
			} catch (e) {
				setError(e?.response?.data?.error || e.message || 'Failed to update puppy');
			}
		}

		async function removePuppy(id) {
			try {
				await axios.delete(`${API_BASE}/puppies/${id}`);
				setPuppies(prev => prev.filter(p => p.id !== id));
				if (editingId === id) cancelEdit();
			} catch (e) {
				setError(e?.response?.data?.error || e.message || 'Failed to delete puppy');
			}
		}

	return (
		<section style={{ padding: 16 }}>
			{error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}

			<h2>Puppies</h2>
			<div style={{ overflowX: 'auto' }}>
				<table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
					<thead>
						<tr>
							<th style={th}>ID</th>
							<th style={th}>Name</th>
							<th style={th}>Breed</th>
							<th style={th}>Weight (lbs)</th>
							<th style={th}>Vaccinated</th>
								<th style={th}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{puppies.map(p => (
							<tr key={p.id}>
								<td style={td}>{p.id}</td>
									<td style={td}>
										{editingId === p.id ? (
											<input
												value={editRow.name}
												onChange={e => setEditRow(s => ({ ...s, name: e.target.value }))}
											/>
										) : p.name}
									</td>
									<td style={td}>
										{editingId === p.id ? (
											<input
												value={editRow.breed}
												onChange={e => setEditRow(s => ({ ...s, breed: e.target.value }))}
											/>
										) : (p.breed ?? '')}
									</td>
									<td style={td}>
										{editingId === p.id ? (
											<input
												type="number"
												step="0.01"
												value={editRow.weight_lbs}
												onChange={e => setEditRow(s => ({ ...s, weight_lbs: e.target.value }))}
											/>
										) : (p.weight_lbs ?? '')}
									</td>
									<td style={td}>
										{editingId === p.id ? (
											<input
												type="checkbox"
												checked={!!editRow.vaccinated}
												onChange={e => setEditRow(s => ({ ...s, vaccinated: e.target.checked }))}
											/>
										) : (p.vaccinated ? 'Yes' : 'No')}
									</td>
									<td style={td}>
										{editingId === p.id ? (
											<>
												<button onClick={() => saveEdit(p.id)} type="button">Save</button>
												<button style={{ marginLeft: 8 }} onClick={cancelEdit} type="button">Cancel</button>
											</>
										) : (
											<>
												<button onClick={() => startEdit(p)} type="button">Edit</button>
												<button style={{ marginLeft: 8 }} onClick={() => removePuppy(p.id)} type="button">Delete</button>
											</>
										)}
									</td>
							</tr>
						))}
							{puppies.length === 0 && (
								<tr><td style={td} colSpan={6}>No puppies yet.</td></tr>
						)}
					</tbody>
				</table>
			</div>

			<h3 style={{ marginTop: 16 }}>Add Puppy</h3>
			<form onSubmit={addPuppy} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
				<input
					placeholder="Name (required)"
					value={form.name}
					onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
				/>
				<input
					placeholder="Breed"
					value={form.breed}
					onChange={e => setForm(s => ({ ...s, breed: e.target.value }))}
				/>
				<input
					placeholder="Weight (lbs)"
					type="number"
					step="0.01"
					value={form.weight_lbs}
					onChange={e => setForm(s => ({ ...s, weight_lbs: e.target.value }))}
				/>
				<label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
					<input
						type="checkbox"
						checked={form.vaccinated}
						onChange={e => setForm(s => ({ ...s, vaccinated: e.target.checked }))}
					/>
					Vaccinated
				</label>
				<button type="submit">Add</button>
			</form>
		</section>
	);
};

const th = { textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' };
const td = { borderBottom: '1px solid #eee', padding: '8px 6px' };

export default Body;

