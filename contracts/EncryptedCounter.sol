// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title EncryptedCounter — Day 1 E2E spike
/// @notice 验证 relayer 全链路：客户端加密 → 合约存密文 → relayer 解密 → 前端展示
contract EncryptedCounter is ZamaEthereumConfig {
    euint32 private _value;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    /// Submit an encrypted uint32 value (client-side encrypted via relayer SDK)
    function setValue(
        externalEuint32 encryptedInput,
        bytes calldata inputProof
    ) public {
        euint32 val = FHE.fromExternal(encryptedInput, inputProof);
        _value = val;
        FHE.allowThis(_value);
    }

    /// Convenience: set value from plaintext (trivial encryption, for testing)
    function setValueTrivial(uint32 plainValue) public {
        _value = FHE.asEuint32(plainValue);
        FHE.allowThis(_value);
    }

    /// Grant decryption permission for the stored value
    function allowValueDecryption() public {
        FHE.allowThis(_value);
    }

    /// Read the raw euint32 handle (for decryption by relayer)
    function getValue() public view returns (euint32) {
        return _value;
    }
}
