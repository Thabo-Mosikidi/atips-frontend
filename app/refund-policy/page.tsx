/**
 * REFUND POLICY
 * MUST be strict for payment approval
 */

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-2xl font-semibold mb-6">Refund Policy</h1>

      <p className="mb-4">
        All payments made on A.TIPS are voluntary and represent financial
        appreciation for content already consumed.
      </p>

      <p className="mb-4 font-semibold text-red-600">
        All payments are final and non-refundable.
      </p>

      <p className="mb-4">
        A.TIPS does not provide refunds for any completed transactions.
      </p>

      <p>
        If a technical issue occurs, users may contact support for assistance.
      </p>
    </div>
  );
}