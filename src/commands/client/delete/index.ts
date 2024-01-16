import { Command } from "@commands/command";

export class DeleteCommand extends Command<{ deleted: number }> {
  constructor(id: (number[] | string[]) | number | string) {
    const finalArr = [];
    if (Array.isArray(id)) {
      finalArr.push(...id);
    } else {
      finalArr.push(id);
    }
    super(finalArr, "delete");
  }
}
