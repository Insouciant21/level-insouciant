const custodianDispatches = [
  "先整理命名、边界和证据，再决定是否继续深入。",
  "记录那些会重复出现的结构，路径才不会只依赖记忆。",
  "给后来抵达的人留下足够诚实的说明，而不是夸张的传奇。",
  "荧光灯仍在稳定嗡鸣；在无法确认出口前，先标记好走过的门牌。",
  "当走廊看似完全相同时，编号与日期就是唯一的坐标锚点。",
  "把零散的观察拆成可核对的条目，混乱的空间也会慢慢显出秩序。",
] as const

function selectCustodianDispatches(count: number): string[] {
  const hourBucket = Math.floor(Date.now() / 3_600_000)
  const startIndex = hourBucket % custodianDispatches.length

  return Array.from({ length: count }, (_, offset) => {
    const index = (startIndex + offset) % custodianDispatches.length
    return custodianDispatches[index]
  })
}

export async function getHitokotoQuotes(count = 3) {
  return selectCustodianDispatches(count)
}
