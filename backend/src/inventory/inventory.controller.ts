import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { InventoryService } from "./inventory.service";

@Controller("inventory")
@UseGuards(AuthGuard("jwt"))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("summary")
  getSummary(@Req() req: any) {
    return this.inventoryService.getSummary(req.user);
  }

  @Get("kits")
  listKits(
    @Req() req: any,
    @Query("status") status?: string,
    @Query("officialId") officialId?: string,
    @Query("number") number?: string,
  ) {
    return this.inventoryService.listKits(req.user, {
      status,
      officialId,
      number,
    });
  }

  @Get("kits/my")
  listMyKits(@Req() req: any) {
    return this.inventoryService.listMyKits(req.user);
  }

  @Get("kits/by-official")
  listKitsByOfficial(@Req() req: any, @Query("officialId") officialId: string) {
    return this.inventoryService.listKitsByOfficial(req.user, officialId);
  }

  @Get("movements")
  listMovements(@Req() req: any, @Query("kitId") kitId?: string) {
    return this.inventoryService.listMovements(req.user, kitId);
  }

  @Post("entries")
  createEntry(@Req() req: any, @Body() body: any) {
    return this.inventoryService.createEntry(req.user, {
      quantity: Number(body.quantity),
      initialNumber: String(body.initialNumber || "").trim(),
      finalNumber: String(body.finalNumber || "").trim(),
      notes: body.notes,
    });
  }

  @Post("transfers")
  transferToDco(@Req() req: any, @Body() body: any) {
    return this.inventoryService.transferToDco(req.user, {
      officialId: body.officialId,
      initialNumber: body.initialNumber
        ? String(body.initialNumber || "").trim()
        : undefined,
      finalNumber: body.finalNumber
        ? String(body.finalNumber || "").trim()
        : undefined,
      kitNumbers: Array.isArray(body.kitNumbers)
        ? body.kitNumbers
            .map((number: unknown) => String(number || "").trim())
            .filter(Boolean)
        : undefined,
      notes: body.notes,
    });
  }


  @Delete("kits/:kitId")
  deleteKit(@Req() req: any, @Param("kitId") kitId: string) {
    return this.inventoryService.deleteKit(req.user, kitId);
  }

  @Patch("kits/:kitId/transfer")
  moveKitToDco(
    @Req() req: any,
    @Param("kitId") kitId: string,
    @Body() body: any,
  ) {
    return this.inventoryService.moveKitToDco(req.user, kitId, {
      officialId: body.officialId,
      notes: body.notes,
    });
  }

  @Patch("kits/:kitId/return-to-stock")
  returnKitToStock(@Req() req: any, @Param("kitId") kitId: string) {
    return this.inventoryService.returnKitToStock(req.user, kitId);
  }


@Get("lbcd-shipping/kits")
listLbcdShippingKits(@Req() req: any) {
  return this.inventoryService.listLbcdShippingKits(req.user);
}

@Patch("lbcd-shipping/mark-sent")
markLbcdShippingKitsAsSent(@Req() req: any, @Body() body: any) {
  return this.inventoryService.markLbcdShippingKitsAsSent(req.user, {
    kitIds: body.kitIds,
  });
}

  @Get("matches/:matchId/kits")
  listMatchKits(@Param("matchId") matchId: string) {
    return this.inventoryService.listMatchKits(matchId);
  }

  @Post("matches/:matchId/kits")
  attachKitsToMatch(
    @Req() req: any,
    @Param("matchId") matchId: string,
    @Body() body: any,
  ) {
    return this.inventoryService.attachKitsToMatch(req.user, matchId, {
      kitIds: body.kitIds,
    });
  }

  @Delete("matches/:matchId/kits/:kitId")
  removeKitFromMatch(
    @Req() req: any,
    @Param("matchId") matchId: string,
    @Param("kitId") kitId: string,
  ) {
    return this.inventoryService.removeKitFromMatch(req.user, matchId, kitId);
  }
}
