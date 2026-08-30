import assert from "node:assert/strict";
import test from "node:test";

import { commercialFacts } from "../../lib/commercial-facts";
import {
  contact,
  contactAvailability,
  contactChannels,
  contactLinks,
} from "../../lib/site";

test("the public contact page has complete confirmed contact details", () => {
  assert.equal(contact.email, "support@selenasystems.com");
  assert.equal(contact.telegram, "@kora_selena");
  assert.equal(contact.phone, "+1 307-888-0205");
  assert.equal(contactAvailability.ru, "GMT+8, Бали · отвечаю в течение рабочего дня");

  assert.equal(contactLinks.email, "mailto:support@selenasystems.com");
  assert.equal(contactLinks.telegram, "https://t.me/kora_selena");
  assert.equal(contactLinks.phone, "tel:+13078880205");
  assert.deepEqual(
    contactChannels.slice(0, 3).map((channel) => channel.key),
    ["email", "telegram", "phone"],
  );
});

test("the footer names the confirmed legal entity", () => {
  assert.equal(
    commercialFacts.seller.footerLine,
    "Selena Systems LLC, a Wyoming limited liability company",
  );
});
