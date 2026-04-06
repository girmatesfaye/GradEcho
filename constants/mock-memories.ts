import type { Memory } from "@/types/memory";

/** Placeholder content aligned with Stitch HTML references */
export const MOCK_MEMORIES: Memory[] = [
  {
    id: "1",
    authorName: "Amina J.",
    authorMeta: "CS 2024",
    university: "Stanford University",
    imageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAx9G_KaaDk8naGAtFXhvzaq9r01GkPZSjotBYJ5WhOSp4yx7nIXwhf9YYhabEejw_0a-Z3CRTior4FJ68VU3qnVAOfy5gYuN-LQond9r1MhVcMJp4ZfINDS0IE_DMt5Xuw0xpwYa7C8SPNOfU4FoqY3ey8EWjzkzcY6ssyXujiplWhrFEjpQm_0POh4DzaZqRa3JQ9bKXDjcUXDXax7FNu1n34D-TL42LW9ePJaa88TvZVLhL-NpWwHPA0eESZUBZS11P-QxnBeby7",
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSNB8a-fA5h83COeFlX_P9eHUkJmLxCih7EjX262ykH0gfpXyt2JVH_Udi0VRIAQOMn4oIyyV1uBrPQe7GdOiVqJKQmELu9opdSIJ_wdCjNjQ5PAEZ-qlClpblp8u6fhfj4BDzL9K0JhSYSadDBRPDa6FBleNe35l1QVAZCa4WLYWGcHd8VOBdMs9dQ4jxalwXgmFQjbKAVcZxiXUpy5k-lzWhtBNPAjk5-FFP5DjVsCdJy7S5sK2MQI5LDlkL7ysLvv9hg9UcKuZ3",
    quote:
      "Four years of late nights and endless coffee. We finally made it, team! Can't wait to see where we all go next.",
    tags: ["#GRADUATION", "#MEMORIES", "#CLASS2024"],
    likesCount: "1.2K",
    title: "The moment we finally made it.",
    reflection:
      "Walking across that stage felt like a movie. Four years of late nights and endless coffee led to this single second of pure joy.",
    hasVoice: true,
    voiceLabel: "Voice Memo: The Speech",
    voiceDuration: "01:42",
  },
  {
    id: "2",
    authorName: "Marcus Thorne",
    authorMeta: "Arch 2024",
    university: "Stanford University",
    imageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCJZDx1A3hL7ot3xcjdEGZlnGsiCoGPu3OrvpVHT4a2NWj6dORd-v_16ZiQVYmyvw2oEQcwgDDZiO15Rqy-1aoLhjQCx_jSceYmHMhrvnMJTSSDPStpgWsXPNWtApjXKib-GOnTL4lncHN8cABdvAEaybhuJfahkT-OT-VaCYJbMJ1tFnfUsxmjpTndb8z1TLjRrLQbQk-Lfcr92k_RtdQFOSlJMfknoh2TXVeu5iMeaidyMbDoMilGP3zHCuUywLQOoyasqkQOsx2O",
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBX2Aa5SNI9zBH2_vhVZa_IDaKwl_aCKVuqyiWh3OQDYvz4kBH7mZmnYK7wJ-kwvkk_dmw8mCtfp2HvB7yUOzZCnCny_kwzH40ed2r4L3Hox2XHHh800cQYLTti7nhtvsiapR5gM-l_KPKSUrNiIxy9pVd8kIkaPUASfV86KCeSoaXzQy4yp1I2YNSz9IGOuTZqeRWJy64X74k7qFZ2yI76qFOyomnqiz2RsxEHrVlb-KPlgQz5naN8s3vJok3IQn1rdowAWikifg3e",
    quote:
      "The drafting room at 3 AM hit differently. This building holds all our dreams and a lot of lost sleep.",
    tags: ["#ARCHITECTURE", "#LATE-NIGHTS", "#CLASS2024"],
    likesCount: "864",
  },
  {
    id: "3",
    authorName: "Sofia R.",
    authorMeta: "Bio 2024",
    university: "Stanford University",
    imageUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Xrx1HXCXSo0Rhxi5DHDxQEFFf6pMCtU4D2nzdcBFV6oxDykZMHvq0iY4jHgTU59BU6FawvgN7v5sDWIuVuk0Cstmi9lUrwEYqs1oIaQ0tKLnTbSfTfDgtoKHUuTy-TD1SxaqjXu-nfYsudnBnYlWUIFd_R9xwiAESWQDpUaXsPs6PeHD5fA_je8_ISfTm4XVAtWYJLLAEXFXpFD-mwwJl2FExJXgFk1Fe5U2Q4Ms6u1mDtBM8RJvESo87SjQHmu3vGeiNQ4s2utU",
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDigwncOBpv2TXfewZ5ZQuJATfKG2H0vfcY5AzyUY2SmhrK72YjKvnNn3dTRKb79BPr100UkJEBb1-CLhQwi7bQTw2M2jGVH-1gErJP3W2GvT1oeWTSZxLoCiZ1Z74Ef6y8Incvc0M0hM86RyHCDLSafFCW991BKHCrVao7FjOsKbyIWPLFrGI-m0tVFby1TK0x7GpDAxqq1TgRt-qqZdo3fjWNGVCuWckcLk-iybxqGS7h99Fjfaoh5ZxyR9KpGCPGQXr_pp9n0SJh",
    quote: "Last lecture, best friends. The quad will never look the same.",
    tags: ["#FRIENDS", "#FINALS", "#CLASS2024"],
    likesCount: "942",
  },
];

export function getMemoryById(id: string): Memory | undefined {
  return MOCK_MEMORIES.find((m) => m.id === id);
}
