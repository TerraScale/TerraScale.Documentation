---
title: Compensation Policy
description: Billing rules for rollover usage, overage tolerance, and monthly operation limits.
---

This policy explains how TerraScale handles unused operations, monthly resets, and short overages. The goal is simple: give you predictable billing without cutting off healthy workloads.

> Note: This page keeps the legacy `/reference/compesation/` URL for compatibility with existing links.

## What is usage rollover

If your plan includes a monthly operation allowance and you do not use all of it, the unused portion rolls into the next month.

Rollover gives you extra flexibility for uneven traffic patterns. It is designed for normal month to month variation, not as a permanent replacement for upgrading to a larger plan.

## How rollover works

TerraScale applies your current month's included operations first. After that, any unused operations rolled over from the previous month are used.

Rollover is valid for one additional billing cycle only.

### Rollover rules

- Unused included operations roll into the next month.
- Current month usage is consumed before rolled over usage.
- Any rollover amount expires at the end of the next month if it is not used.
- Rollover does not stack indefinitely across multiple months.

## Over-usage policy

TerraScale does not hard block requests by default when you exceed your monthly included operations.

Instead, we apply the following policy:

- We notify you when usage exceeds your plan's monthly allowance.
- Usage up to 20% above your monthly allowance is tolerated without an overage charge.
- If usage exceeds that 20% tolerance within a single billing month, the excess may be charged separately.
- If we detect repeated overages that suggest your workload no longer fits the plan, we may ask you to upgrade.
- If your account settings allow it, you can disable overages and have excess requests blocked instead.

## Examples

### Example 1: full use of the current month, partial use of rollover

Assume a plan includes 10 million operations per month.

| Month | Included operations | Rolled in from previous month | Total available | Operations used | Rollover to next month |
| --- | ---: | ---: | ---: | ---: | ---: |
| January | 10 million | 0 | 10 million | 1 million | 9 million |
| February | 10 million | 9 million | 19 million | 12 million | 0 |
| March | 10 million | 0 | 10 million | Depends on March usage | Depends on March usage |

In this scenario, the 9 million unused operations from January roll into February. February uses its own included 10 million first, then 2 million of the rollover. The remaining 7 million rollover from January expires at the end of February.

### Example 2: rollover after a light month

Assume the same plan includes 10 million operations per month.

| Month | Included operations | Rolled in from previous month | Total available | Operations used | Rollover to next month |
| --- | ---: | ---: | ---: | ---: | ---: |
| January | 10 million | 0 | 10 million | 5 million | 5 million |
| February | 10 million | 5 million | 15 million | 2 million | 8 million |
| March | 10 million | 8 million | 18 million | Depends on March usage | Depends on March usage |

Here, February uses only 2 million of its included 10 million. Because the rolled over 5 million from January was not needed, it expires at the end of February. March receives the 8 million unused portion of February's included allowance.

### Example 3: overage tolerance

Assume a plan includes 1 million operations per month.

| Monthly allowance | Usage | Percent over plan | Result |
| ---: | ---: | ---: | --- |
| 1 million | 1.1 million | 10% | Warning only, no overage charge |
| 1 million | 1.2 million | 20% | Warning only, no overage charge |
| 1 million | 1.25 million | 25% | Separate overage charge may apply |

## Related

- [Pricing](/reference/pricing/)
- [Plans](/reference/plans/)
- [Billing](/reference/billing/)
- [Rate Limits](/reference/rate-limits/)
