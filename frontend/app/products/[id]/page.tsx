type Product = {
  _id: string;
  name: string;
  category: string;
  price: string;
  delivery: string;
  origin: string;
  description?: string;
  image?: string;
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`http://afrilinkcapital.onrender.com/products/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();

  const product: Product | null = data.product || null;

  if (!product) {
    return <main className="p-6">Product not found</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="h-72 bg-gray-200 rounded mb-6 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500">Product Image</span>
          )}
        </div>

        <p className="text-sm text-blue-700 font-semibold">
          {product.category}
        </p>

        <h1 className="text-3xl font-bold mt-2 mb-4">{product.name}</h1>

        <p className="text-gray-700 mb-4">
          {product.description || "No description provided"}
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-gray-100 p-4 rounded">
            <strong>Estimated Price</strong>
            <p>{product.price}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <strong>Origin</strong>
            <p>{product.origin}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <strong>Delivery Time</strong>
            <p>{product.delivery}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="text-sm text-gray-700">
            Supplier details are protected. Afrilink Capital manages sourcing,
            negotiation, supplier communication, shipping, customs clearance,
            and delivery.
          </p>
        </div>

        <a
          href={`/post-request?product=${encodeURIComponent(product.name)}`}
          className="inline-block bg-blue-900 text-white px-6 py-3 rounded font-semibold"
        >
          Request Through Afrilink
        </a>
      </div>
    </main>
  );
}