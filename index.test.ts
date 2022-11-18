import HyperLogLog from "./index"
import { XXHash32, XXHash64 } from "xxhash-addon"
import { equal, ok } from "assert"

describe("HyperLogLog", () => {
   it("should construct properly", () => {
      const h = new HyperLogLog(4, (value) => {
         const buffer = Buffer.from(value)
         return XXHash32.hash(buffer)
      })
      equal(h.buckets.length, 16)
   })

   it("should insert", () => {
      const h = new HyperLogLog(4, (value) => {
         const buffer = Buffer.from(value)
         return XXHash32.hash(buffer)
      })
      h.insert("hello")
      h.insert("world")
      h.insert("something")
      h.insert("something else")
      const largest = h.getLargestBucket()
      ok(largest > 0)
   })

   it("should have values larger than 1", () => {
      const h = new HyperLogLog(4, (value) => {
         const buffer = Buffer.from(value)
         return XXHash32.hash(buffer)
      })
      for (let i = 0; i < 1000; i++) {
         h.insert(`hello${i}`)
      }
      const largest = h.getLargestBucket()
      ok(largest > 2)
   })

   it("should estimate correctly", () => {
      const h = new HyperLogLog(4, (value) => {
         const buffer = Buffer.from(value)
         return XXHash64.hash(buffer)
      })
      for (let i = 0; i < 100000; i++) {
         h.insert(`${i}`)
      }
      const estimate = h.getEstimate()
      ok(estimate > 90000 && estimate < 110000)
   })

   it("should merge two instancs", () => {
      const hashFunction = (value: string) => {
         const buffer = Buffer.from(value)
         return XXHash64.hash(buffer)
      }
      const h1 = new HyperLogLog(4, hashFunction)
      h1.buckets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      const h2 = new HyperLogLog(4, hashFunction)
      h2.buckets = [42, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 99]
      h1.merge(h2)
      equal(h1.buckets[0], 42)
      equal(h1.buckets[15], 99)
   })
})
