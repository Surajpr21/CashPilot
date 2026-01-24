import React, { useMemo, useState } from "react";
import "./InvestmentsCard.css";

export default function InvestmentsCard() {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("Mutual Fund");

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState("Active");

  const [rdMonthly, setRdMonthly] = useState("1000");
  const [rdTenure, setRdTenure] = useState("12");
  const [rdRate, setRdRate] = useState("");

  const [mfMode, setMfMode] = useState("SIP");
  const [mfAmount, setMfAmount] = useState("5000");
  const [mfFrequency, setMfFrequency] = useState("Monthly");
  const [mfUnits, setMfUnits] = useState("");
  const [mfNav, setMfNav] = useState("");

  const [stockQty, setStockQty] = useState("10");
  const [stockBuy, setStockBuy] = useState("1200");
  const [stockCurrent, setStockCurrent] = useState("");

  const [fdPrincipal, setFdPrincipal] = useState("50000");
  const [fdTenure, setFdTenure] = useState("12");
  const [fdRate, setFdRate] = useState("7");
  const [fdMaturityDate, setFdMaturityDate] = useState("");

  const [pensionAmount, setPensionAmount] = useState("10000");
  const [bondsAmount, setBondsAmount] = useState("20000");
  const [otherAmount, setOtherAmount] = useState("");

  const rdTotal = useMemo(() => {
    const monthly = Number(rdMonthly) || 0;
    const tenure = Number(rdTenure) || 0;
    return monthly * tenure;
  }, [rdMonthly, rdTenure]);

  const stockTotal = useMemo(() => {
    const qty = Number(stockQty) || 0;
    const price = Number(stockBuy) || 0;
    return qty * price;
  }, [stockQty, stockBuy]);

  return (
    <div className="assets-page-card">
      <div className="assets-page-card-header">
        <h3>Investments</h3>
        <button className="assets-page-add-btn" onClick={() => setShowForm(true)}>
          + Add investment
        </button>
      </div>

      <ul className="assets-page-list">
        <li>
          <span>Nifty 50 Index Fund</span>
          <strong>₹3,20,000</strong>
        </li>
        <li>
          <span>SBI Fixed Deposit</span>
          <strong>₹2,00,000</strong>
        </li>
        <li>
          <span>ICICI Bank Stock</span>
          <strong>₹1,20,000</strong>
        </li>
        <li>
          <span>Axis Bluechip Fund</span>
          <strong>₹1,00,000</strong>
        </li>
        <li>
          <span>SBI RD</span>
          <strong>₹1,20,000</strong>
        </li>
      </ul>

      {showForm && (
        <div
          className="assets-page-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowForm(false)}
        >
          <div className="assets-page-modal" onClick={e => e.stopPropagation()}>
            <div className="assets-page-modal-header">
              <div>
                <p className="assets-page-modal-kicker">Add investment</p>
                <h4>Unified investment form</h4>
              </div>
              <button
                className="assets-page-modal-close"
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="assets-page-form">
              <div className="assets-page-form-row">
                <label>Investment type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option>Mutual Fund</option>
                  <option>Stock</option>
                  <option>Fixed Deposit (FD)</option>
                  <option>Recurring Deposit (RD)</option>
                  <option>PPF / EPF / NPS</option>
                  <option>Bonds</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="assets-page-form-grid">
                <div className="assets-page-form-row">
                  <label>Investment name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. SBI RD, Nifty 50 Index Fund"
                  />
                </div>
                <div className="assets-page-form-row">
                  <label>Provider / Institution</label>
                  <input
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    placeholder="SBI, ICICI, Zerodha"
                  />
                </div>
                <div className="assets-page-form-row">
                  <label>Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="assets-page-form-row">
                  <label>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option>Active</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              {type === "Recurring Deposit (RD)" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-form-row">
                    <label>Monthly deposit amount (₹)</label>
                    <input value={rdMonthly} onChange={e => setRdMonthly(e.target.value)} />
                  </div>
                  <div className="assets-page-form-row">
                    <label>Tenure (months)</label>
                    <input value={rdTenure} onChange={e => setRdTenure(e.target.value)} />
                  </div>
                  <div className="assets-page-form-row">
                    <label>Interest rate (optional)</label>
                    <input value={rdRate} onChange={e => setRdRate(e.target.value)} placeholder="%" />
                  </div>
                  <p className="assets-page-muted">
                    Total invested till date: ₹{rdTotal.toLocaleString()} (months × amount)
                  </p>
                  <p className="assets-page-muted">Estimated maturity is indicative only.</p>
                </div>
              )}

              {type === "Mutual Fund" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-pill-row">
                    <button
                      type="button"
                      className={`assets-page-pill ${mfMode === "SIP" ? "active" : ""}`}
                      onClick={() => setMfMode("SIP")}
                    >
                      SIP
                    </button>
                    <button
                      type="button"
                      className={`assets-page-pill ${mfMode === "Lump sum" ? "active" : ""}`}
                      onClick={() => setMfMode("Lump sum")}
                    >
                      Lump sum
                    </button>
                  </div>
                  <div className="assets-page-form-grid">
                    <div className="assets-page-form-row">
                      <label>Amount</label>
                      <input value={mfAmount} onChange={e => setMfAmount(e.target.value)} />
                    </div>
                    <div className="assets-page-form-row">
                      <label>Frequency</label>
                      <select value={mfFrequency} onChange={e => setMfFrequency(e.target.value)}>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </div>
                    <div className="assets-page-form-row">
                      <label>Units (optional)</label>
                      <input value={mfUnits} onChange={e => setMfUnits(e.target.value)} />
                    </div>
                    <div className="assets-page-form-row">
                      <label>NAV (optional)</label>
                      <input value={mfNav} onChange={e => setMfNav(e.target.value)} />
                    </div>
                  </div>
                  <p className="assets-page-muted">Total invested is derived; no expenses are created.</p>
                </div>
              )}

              {type === "Stock" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-form-grid">
                    <div className="assets-page-form-row">
                      <label>Quantity</label>
                      <input value={stockQty} onChange={e => setStockQty(e.target.value)} />
                    </div>
                    <div className="assets-page-form-row">
                      <label>Buy price</label>
                      <input value={stockBuy} onChange={e => setStockBuy(e.target.value)} />
                    </div>
                    <div className="assets-page-form-row">
                      <label>Current price (optional)</label>
                      <input value={stockCurrent} onChange={e => setStockCurrent(e.target.value)} />
                    </div>
                  </div>
                  <p className="assets-page-muted">
                    Total invested: ₹{stockTotal.toLocaleString()} (qty × buy price)
                  </p>
                </div>
              )}

              {type === "Fixed Deposit (FD)" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-form-grid">
                    <div className="assets-page-form-row">
                      <label>Principal</label>
                      <input value={fdPrincipal} onChange={e => setFdPrincipal(e.target.value)} />
                    </div>
                    <div className="assets-page-form-row">
                      <label>Tenure (months)</label>
                      <input value={fdTenure} onChange={e => setFdTenure(e.target.value)} />
                    </div>
                    <div className="assets-page-form-row">
                      <label>Interest rate</label>
                      <input value={fdRate} onChange={e => setFdRate(e.target.value)} placeholder="%" />
                    </div>
                    <div className="assets-page-form-row">
                      <label>Maturity date</label>
                      <input
                        type="date"
                        value={fdMaturityDate}
                        onChange={e => setFdMaturityDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="assets-page-muted">FDs increase Assets and Invested Amount; no expenses are logged.</p>
                </div>
              )}

              {type === "PPF / EPF / NPS" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-form-row">
                    <label>Contribution amount</label>
                    <input value={pensionAmount} onChange={e => setPensionAmount(e.target.value)} />
                  </div>
                  <p className="assets-page-muted">Treated as long-term investment; not an expense.</p>
                </div>
              )}

              {type === "Bonds" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-form-row">
                    <label>Amount</label>
                    <input value={bondsAmount} onChange={e => setBondsAmount(e.target.value)} />
                  </div>
                  <p className="assets-page-muted">Allocates to Investments slice; savings/expenses untouched.</p>
                </div>
              )}

              {type === "Other" && (
                <div className="assets-page-form-section">
                  <div className="assets-page-form-row">
                    <label>Amount</label>
                    <input value={otherAmount} onChange={e => setOtherAmount(e.target.value)} />
                  </div>
                  <p className="assets-page-muted">Categorized as investment for allocation and totals.</p>
                </div>
              )}

              <div className="assets-page-form-note">
                <p className="assets-page-muted">
                  Adding an investment updates Assets, Invested Amount, and Allocation. No expenses or savings are adjusted; RD deposits are treated as one asset (no monthly expense entries).
                </p>
              </div>

              <div className="assets-page-modal-actions">
                <button type="button" className="assets-page-btn ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="button" className="assets-page-btn primary">
                  Save investment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
