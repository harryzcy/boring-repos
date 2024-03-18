import { assert, test } from 'vitest'
import { getCloudflareAccountID } from './cloudflare.js'

test('Get cloudflare account ID', async () => {
  const accountID = await getCloudflareAccountID()
  assert.isNotEmpty(accountID)
})
