export function RoleSeparator() {
  return (
    <div className="py-6 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B5AF34]/60 to-[#B5AF34]/30 max-w-xs"></div>
          <div className="px-4">
            <div className="w-2 h-2 bg-[#B5AF34] rounded-full"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B5AF34]/60 to-[#B5AF34]/30 max-w-xs"></div>
        </div>
      </div>
    </div>
  );
}
