import SideSection from "@/components/Interviewer/Profile/v1/SideSection";
import WishlistDetailClient from "@/components/Wishlist/v1/WishlistDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <div className="grid grid-cols-4 gap-4 p-4 h-screen">
        <div className="col-span-1 h-full">
          <SideSection />
        </div>
        <div className="col-span-3 h-full">
          <WishlistDetailClient wishlistId={id} />
        </div>
      </div>
    </>
  );
}

// export default function page() {
//   return (
//     <div className="grid grid-cols-4 gap-4 p-4 h-screen">
//       <div className="col-span-1 h-full">
//         <SideSection />
//       </div>
//       <div className="col-span-3 h-full">
//         <WishlistTable />
//       </div>
//     </div>
//   );
// }
